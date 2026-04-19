# ===========
# BUILD STAGE
# ===========

# create project structure, download all dependencies, and build project 

# /app
#    /src
#    /target
#          /classes
#          /generated-sources
#    pom.xml

FROM maven:3.9.6-eclipse-temurin-17 AS build

# create project directory /app
WORKDIR /app

# copy pom.xml to /app/pom.xml
COPY pom.xml .

# download all dependencies and store them in ~/.m2/repository 
RUN mvn dependency:go-offline

# copy src to /app/src
COPY src ./src

# delete old build files in /app/target/app-<version>.jar, build new files in /app/target/app-<version>.jar and skip test cases
RUN mvn clean package -DskipTests


# =============
# RUNTIME STAGE
# =============

FROM eclipse-temurin:17-jre-alpine

# create project directory /app
WORKDIR /app

# create a system group named dev-group. create a system user dev and add to dev-group group
# dev-group(dev)
RUN addgroup -S dev-group 
RUN adduser -S dev -G dev-group

# from build stage copy the build files in /app/target/app-<version>.jar to current directory /app/app.jar
# /app
#    /app.jar
COPY --from=build /app/target/*.jar app.jar

# switch to dev user
USER dev

# expose application port on 8080
EXPOSE 8080


# set the entry point to run the application using java command with specified memory settings and the jar file
ENTRYPOINT ["java","-Xms64m","-Xmx224m","-XX:+UseSerialGC","-XX:MaxRAM=256m","-XX:+UseContainerSupport","-XX:MaxMetaspaceSize=128m","-jar","app.jar"]