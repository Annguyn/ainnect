FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests -B dependency:go-offline
COPY src ./src
# đảm bảo repackage chạy
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests -B clean package spring-boot:repackage

FROM eclipse-temurin:21-jre
WORKDIR /app
# copy đúng file jar đã repackage (thường chỉ có 1 cái trong target)
COPY --from=build /app/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
