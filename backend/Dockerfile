# Use an official OpenJDK 8 runtime as the base image
FROM openjdk:21-ea

# Set the working directory inside the container
WORKDIR /app

# Copy the JAR file of your Spring Boot application into the container
COPY booking_main_app/target/booking_main_app-0.0.1-SNAPSHOT.jar backend-0.0.1-SNAPSHOT.jar

# Command to run the Spring Boot application
CMD ["java", "-jar", "backend-0.0.1-SNAPSHOT.jar"]
