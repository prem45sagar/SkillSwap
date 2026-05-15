package com.skillswap.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Room state: roomId -> (peerId -> UserData)
    private final Map<String, Map<String, Map<String, Object>>> rooms = new ConcurrentHashMap<>();
    // Session state: sessionId -> peerId
    private final Map<String, String> sessionPeerIds = new ConcurrentHashMap<>();
    // Session state: sessionId -> roomId
    private final Map<String, String> sessionRooms = new ConcurrentHashMap<>();

    // --- Chat Events ---
    @MessageMapping("/chat.send")
    public void sendChatMessage(@Payload Map<String, Object> message) {
        String receiverId = (String) message.get("receiver");
        if (receiverId != null) {
            message.put("type", "receive_message");
            messagingTemplate.convertAndSend("/topic/chat/" + receiverId, (Object) message);
        }
    }

    @MessageMapping("/chat.delete")
    public void deleteChatMessage(@Payload Map<String, Object> payload) {
        String receiverId = (String) payload.get("receiver");
        if (receiverId != null) {
            payload.put("type", "message_deleted");
            messagingTemplate.convertAndSend("/topic/chat/" + receiverId, (Object) payload);
        }
    }

    // --- Video Call Events ---
    @MessageMapping("/video.join")
    public void joinVideoRoom(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        String roomId = (String) payload.get("roomId");
        String userName = (String) payload.get("userName");
        String peerId = (String) payload.get("peerId"); // Client generated unique ID
        String sessionId = headerAccessor.getSessionId();
        
        if (roomId == null || userName == null || peerId == null) return;
        roomId = roomId.toUpperCase();

        rooms.putIfAbsent(roomId, new ConcurrentHashMap<>());
        Map<String, Map<String, Object>> room = rooms.get(roomId);

        long count = room.values().stream().filter(u -> userName.equals(u.get("name"))).count();
        String finalUserName = count > 0 ? userName + " (" + (room.size() + 1) + ")" : userName;

        Map<String, Object> user = new HashMap<>();
        user.put("id", peerId);
        user.put("name", finalUserName);
        user.put("videoEnabled", true);
        user.put("audioEnabled", true);
        user.put("joinTime", System.currentTimeMillis());

        room.put(peerId, user);
        sessionRooms.put(sessionId, roomId);
        sessionPeerIds.put(sessionId, peerId);

        List<Map<String, Object>> existingUsers = new ArrayList<>();
        for (Map<String, Object> u : room.values()) {
            if (!u.get("id").equals(peerId)) {
                existingUsers.add(u);
            }
        }
        
        Map<String, Object> roomJoinedPayload = new HashMap<>();
        roomJoinedPayload.put("event", "room-joined");
        roomJoinedPayload.put("roomId", roomId);
        roomJoinedPayload.put("users", existingUsers);
        roomJoinedPayload.put("yourId", peerId);
        messagingTemplate.convertAndSend("/topic/video/user/" + peerId, (Object) roomJoinedPayload);

        Map<String, Object> userJoinedPayload = new HashMap<>(user);
        userJoinedPayload.put("event", "user-joined");
        messagingTemplate.convertAndSend("/topic/video/" + roomId, (Object) userJoinedPayload);

        broadcastParticipants(roomId);
    }

    @MessageMapping("/video.signal")
    public void videoSignal(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        String target = (String) payload.get("target");
        String event = (String) payload.get("event");
        String sessionId = headerAccessor.getSessionId();
        String senderId = sessionPeerIds.get(sessionId);
        
        if (target != null && event != null && senderId != null) {
            Map<String, Object> signal = new HashMap<>();
            signal.put("event", event);
            signal.put("sender", senderId);
            if (payload.containsKey("offer")) signal.put("offer", payload.get("offer"));
            if (payload.containsKey("answer")) signal.put("answer", payload.get("answer"));
            if (payload.containsKey("candidate")) signal.put("candidate", payload.get("candidate"));

            messagingTemplate.convertAndSend("/topic/video/user/" + target, (Object) signal);
        }
    }

    @MessageMapping("/video.broadcast")
    public void broadcastToRoom(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String roomId = sessionRooms.get(sessionId);
        String peerId = sessionPeerIds.get(sessionId);
        String event = (String) payload.get("event");

        if (roomId != null && peerId != null && event != null) {
            Map<String, Map<String, Object>> room = rooms.get(roomId);
            if (room != null && room.containsKey(peerId)) {
                Map<String, Object> user = room.get(peerId);
                
                if ("toggle-video".equals(event)) {
                    Boolean enabled = (Boolean) payload.get("videoEnabled");
                    user.put("videoEnabled", enabled);
                    
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("event", "user-video-toggle");
                    msg.put("userId", peerId);
                    msg.put("videoEnabled", enabled);
                    messagingTemplate.convertAndSend("/topic/video/" + roomId, (Object) msg);
                } 
                else if ("toggle-audio".equals(event)) {
                    Boolean enabled = (Boolean) payload.get("audioEnabled");
                    user.put("audioEnabled", enabled);
                    
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("event", "user-audio-toggle");
                    msg.put("userId", peerId);
                    msg.put("audioEnabled", enabled);
                    messagingTemplate.convertAndSend("/topic/video/" + roomId, (Object) msg);
                }
                else if ("chat-message".equals(event)) {
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("event", "chat-message");
                    msg.put("id", peerId);
                    msg.put("name", user.get("name"));
                    msg.put("message", payload.get("message"));
                    msg.put("timestamp", payload.get("timestamp"));
                    messagingTemplate.convertAndSend("/topic/video/" + roomId, (Object) msg);
                }
                else if ("leave-room".equals(event)) {
                    handleLeaveRoom(sessionId);
                } 
            }
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        handleLeaveRoom(accessor.getSessionId());
    }
    
    private void handleLeaveRoom(String sessionId) {
        String roomId = sessionRooms.remove(sessionId);
        String peerId = sessionPeerIds.remove(sessionId);

        if (roomId != null && peerId != null && rooms.containsKey(roomId)) {
            Map<String, Map<String, Object>> room = rooms.get(roomId);
            Map<String, Object> user = room.remove(peerId);
            
            if (user != null) {
                Map<String, Object> leaveMsg = new HashMap<>();
                leaveMsg.put("event", "user-left");
                leaveMsg.put("id", peerId);
                leaveMsg.put("name", user.get("name"));
                messagingTemplate.convertAndSend("/topic/video/" + roomId, (Object) leaveMsg);
                
                broadcastParticipants(roomId);
            }
            
            if (room.isEmpty()) {
                rooms.remove(roomId);
            }
        }
    }

    private void broadcastParticipants(String roomId) {
        Map<String, Map<String, Object>> room = rooms.get(roomId);
        if (room != null) {
            Map<String, Object> msg = new HashMap<>();
            msg.put("event", "participants-updated");
            msg.put("users", new ArrayList<>(room.values()));
            messagingTemplate.convertAndSend("/topic/video/" + roomId, (Object) msg);
        }
    }
}
