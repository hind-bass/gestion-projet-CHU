# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S itchu && adduser -S itchu -G itchu
USER itchu

COPY --from=build /app/target/*.jar app.jar

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD wget -q --spider http://localhost:3000/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
