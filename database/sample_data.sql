
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` (`booking_id`, `user_id`, `facility_id`, `booking_date`, `start_time`, `end_time`, `purpose`, `status`, `created_at`) VALUES (1,3,2,'2026-11-20','10:00:00','12:00:00','Singles practice','pending','2026-11-09 05:39:39'),(2,4,1,'2026-11-22','07:00:00','09:00:00','Team net session','approved','2026-11-09 05:39:39');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` (`enrollment_id`, `training_id`, `user_id`, `attendance`, `remark`) VALUES (1,1,3,'pending',NULL),(2,1,4,'pending',NULL),(3,2,3,'pending',NULL);
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
INSERT INTO `facilities` (`facility_id`, `name`, `sport`, `location`, `capacity`, `status`) VALUES (1,'City Cricket Ground','Cricket','Pune',2000,'available'),(2,'Indoor Badminton Hall','Badminton','Pune',200,'available'),(3,'District Shooting Range','Shooting','Satara',100,'available'),(4,'Wrestling Akhada Hall','Wrestling','Kolhapur',300,'available'),(5,'Hockey Turf Ground','Hockey','Nashik',1500,'available');
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
INSERT INTO `matches` (`match_id`, `tournament_id`, `team_a`, `team_b`, `match_date`, `match_time`, `status`, `score`, `winner`, `entered_by`) VALUES (1,3,'Pune Hawks','Nashik Lions','2026-11-05','10:00:00','completed','{\"Pune Hawks\": 3, \"Nashik Lions\": 2}','Pune Hawks',2),(2,1,'Pune Warriors','Satara Strikers','2026-12-10','09:00:00','scheduled',NULL,NULL,NULL);
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` (`message_id`, `user_id`, `name`, `email`, `message`, `reply`, `status`, `created_at`) VALUES (1,3,'Sneha Joshi','athlete@ykv.com','How do I register for the Badminton Open?','Login and open the tournament page, then click Register.','replied','2026-11-09 05:39:47'),(2,NULL,'Rahul Deshmukh','rahul@example.com','Is the shooting range open on Sundays?',NULL,'new','2026-11-09 05:39:47');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `registrations` WRITE;
/*!40000 ALTER TABLE `registrations` DISABLE KEYS */;
INSERT INTO `registrations` (`registration_id`, `tournament_id`, `user_id`, `status`, `registered_on`) VALUES (1,1,3,'registered','2026-11-09 05:36:42'),(2,1,4,'registered','2026-11-09 05:36:42'),(3,2,3,'registered','2026-11-09 05:36:42');
/*!40000 ALTER TABLE `registrations` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `tournaments` WRITE;
/*!40000 ALTER TABLE `tournaments` DISABLE KEYS */;
INSERT INTO `tournaments` (`tournament_id`, `title`, `facility_id`, `start_date`, `end_date`, `last_date`, `description`, `status`, `created_by`) VALUES (1,'District Cricket Cup',1,'2026-12-10','2026-12-15','2026-12-01','Open cricket tournament for district teams','upcoming',1),(2,'Badminton Open',2,'2026-12-20','2026-12-22','2026-12-12','Singles and doubles for all age groups','upcoming',1),(3,'State Hockey League',5,'2026-11-01','2026-11-08','2026-10-25','Inter-district hockey league','completed',1);
/*!40000 ALTER TABLE `tournaments` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `trainings` WRITE;
/*!40000 ALTER TABLE `trainings` DISABLE KEYS */;
INSERT INTO `trainings` (`training_id`, `coach_id`, `facility_id`, `title`, `training_date`, `start_time`, `end_time`, `seats`) VALUES (1,2,1,'Cricket Batting Practice','2026-11-15','07:00:00','09:00:00',20),(2,2,2,'Badminton Footwork Session','2026-11-16','17:00:00','18:30:00',10);
/*!40000 ALTER TABLE `trainings` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `phone`, `gender`, `dob`, `address`, `district`, `emergency_phone`, `sport`, `role`, `status`, `created_at`) VALUES (1,'Admin User','admin@ykv.com','$2b$10$IiseQA4WSLCSu9Y7ZQPpj.q06vHBKZKrRmRNlVJDR30YAk.TCfNTy','9800000001','Male','1985-04-12','Pune','Pune',NULL,NULL,'admin','active','2026-11-09 04:13:58'),(2,'Kunal Kulkarni','coach@ykv.com','$2b$10$IiseQA4WSLCSu9Y7ZQPpj.q06vHBKZKrRmRNlVJDR30YAk.TCfNTy','9800000002','Male','1988-08-20','Kolhapur','Kolhapur',NULL,'Cricket','coach','active','2026-11-09 04:13:58'),(3,'Sneha Joshi','athlete@ykv.com','$2b$10$IiseQA4WSLCSu9Y7ZQPpj.q06vHBKZKrRmRNlVJDR30YAk.TCfNTy','9800000003','Female','2004-01-15','Satara','Satara',NULL,'Badminton','athlete','active','2026-11-09 04:13:58'),(4,'Amit Shinde','amit@ykv.com','$2b$10$yqpzWGZf6/vatuIvZe2E2ewuWcWLenVAhDP6z9HKGAPMdKFfNuHvu','9800000004','Male','2003-06-10',NULL,'Pune',NULL,'Hockey','athlete','active','2026-11-09 05:27:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

