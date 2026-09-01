# Runtime image — the fat jar is built by `mvn -DskipTests package` on the host
# (or in CI) before `docker compose build`. Keeps images small and builds fast.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/identity-service-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
