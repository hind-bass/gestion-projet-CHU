package com.itchu.dto.ai;

public record AiContextResponse(
        String status,
        String context,
        int sourcesCount) {

    public static AiContextResponse noIntent() {
        return new AiContextResponse("NO_INTENT", null, 0);
    }

    public static AiContextResponse notFound(String message) {
        return new AiContextResponse("NOT_FOUND", message, 0);
    }

    public static AiContextResponse found(String context, int sourcesCount) {
        return new AiContextResponse("FOUND", context, sourcesCount);
    }

    public static AiContextResponse error(String message) {
        return new AiContextResponse("ERROR", message, 0);
    }
}
