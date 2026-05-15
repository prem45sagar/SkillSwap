package com.skillswap.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "platformsettings")
public class PlatformSettings {
    @Id
    private String id;
    private String platformName = "SkillSwap";
    private boolean maintenanceMode = false;
    private String systemNotice = "";
}
