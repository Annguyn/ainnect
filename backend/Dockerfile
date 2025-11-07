# syntax=docker/dockerfile:1.7

########## BUILD STAGE ##########
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Chỉ copy pom trước để cache dependency
COPY pom.xml .

# Kéo dependency về trước (tận dụng cache)
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -DskipTests -B dependency:go-offline

# Copy source và build jar (spring-boot-plugin sẽ repackage)
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -DskipTests -B clean package

########## RUNTIME STAGE ##########
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy đúng file jar đã repackage (đảm bảo chạy được bằng java -jar)
COPY --from=build /app/target/*.jar /app/app.jar

# Tùy chọn: cấu hình JVM
ENV JAVA_OPTS=""

EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
