CREATE DATABASE  IF NOT EXISTS `mydb` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci */;
USE `mydb`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.13-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Promotions`
--

DROP TABLE IF EXISTS `Promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Promotions` (
  `code` varchar(45) DEFAULT NULL,
  `description` varchar(45) NOT NULL,
  `discount_value` varchar(45) NOT NULL,
  `discount_type` varchar(45) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `Promotion_id` int(11) NOT NULL AUTO_INCREMENT,
  `Stores_id` int(11) NOT NULL,
  `full_description` varchar(200) NOT NULL,
  `image` varchar(80) NOT NULL,
  `title` varchar(45) NOT NULL,
  PRIMARY KEY (`Promotion_id`),
  UNIQUE KEY `PromotionStore_Promotion_id_UNIQUE` (`Promotion_id`),
  KEY `fk_Promotions_Stores1_idx` (`Stores_id`),
  CONSTRAINT `fk_Promotions_Stores1` FOREIGN KEY (`Stores_id`) REFERENCES `Stores` (`Store_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Promotions`
--

LOCK TABLES `Promotions` WRITE;
/*!40000 ALTER TABLE `Promotions` DISABLE KEYS */;
INSERT INTO `Promotions` VALUES ('','Скидка 50 рублей на букет роз','50','BYN','2025-05-20','2025-06-28',12,2,'Скидка 50 рублей на букет роз, состоящий из 101 розы','flowers8m.png','Скидка'),('ЛЕТО2025','Скидка 45 рублей на кроссовки Puma','45','BYN','2025-06-18','2025-06-21',23,6,'Скидка 45 рублей на кроссовки Puma \"Африканская сетка\"','sportmaster.jpeg','Промокод'),('123213','Скидка 30% на любую покупку','30','percentage','2025-06-12','2025-06-17',25,14,'Скидка по промокоду 123213 30% на любую покупку','5ka.png','Промокод'),('','Скидка 33% на картошку фри и чизбургер','33','percentage','2025-06-14','2025-06-19',26,3,'Скидка 33% на картошку фри и чизбургер в период с 10:00 по 16:00 по будням','Burger_king.png','Скидка'),('123','123123','123','BYN','2025-06-14','2025-06-14',27,9,'321312312','5ka.png','Промокод');
/*!40000 ALTER TABLE `Promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Stores`
--

DROP TABLE IF EXISTS `Stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Stores` (
  `Store_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(45) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `Contacts` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Store_id`),
  UNIQUE KEY `Store_id_UNIQUE` (`Store_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Stores`
--

LOCK TABLES `Stores` WRITE;
/*!40000 ALTER TABLE `Stores` DISABLE KEYS */;
INSERT INTO `Stores` VALUES (1,'5 элемент','Лучшие гаджеты и техника','5element.by',NULL),(2,'8 марта','Красивые цветы','https://8marta.org',NULL),(3,'Burger king','Лучшая точка по фаст фуду','https://burger-king.by',NULL),(4,'DNS','Компьютеры и комплектующие','dns-shop.by',NULL),(5,'H&M','Модная одежда для всей семьи','hm.com',NULL),(6,'Спортмастер','Все для спорта и активного отдыха','sportmaster.by',NULL),(7,'Л`Этуаль','Парфюмерия и косметика','letoile.by',NULL),(8,'М.Видео','Бытовая техника и электроника','mvideo.ru',NULL),(9,'Детский мир','Все для детей','detmir.by',NULL),(10,'IKEA','Мебель и товары для дома','ikea.com',NULL),(11,'Читай-город','Книги и канцтовары','chitai-gorod.ru',NULL),(12,'KFC','Острые куриные крылышки','kfc.by',NULL),(13,'Золотое яблоко','Премиальная косметика','goldapple.by','+375 25 679 6914'),(14,'Пятёрочка','Продукты у дома всегда!','5ka.ru',NULL);
/*!40000 ALTER TABLE `Stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `email` varchar(45) NOT NULL,
  `Password` text DEFAULT NULL,
  `name` varchar(45) NOT NULL,
  `email_verified` tinyint(1) DEFAULT NULL,
  `roles_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `date_of_birth` date DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `fk_Users_roles_idx` (`roles_id`),
  CONSTRAINT `fk_Users_roles` FOREIGN KEY (`roles_id`) REFERENCES `roles` (`id_role`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('ivan@mail.ru','пароль123','Иван',1,3,1,NULL),('ezayats1975@gmail.com','$2b$10$2W7oJiN1QpLyrnj4aP2n5en/mvo.lvsZ3cp1U/TSrorE4C92l/4ma','Елена Заяц',0,3,40,'2024-02-08'),('artem.kostyuk.2015@inbox.ru','$2b$10$T2SFuYL0jPUGu.vmFZUqKuIT5hkRXNTDQgY4171iYyafMonqWapmm','Artem Kostyuk',1,5,41,'2005-05-22'),('jamalbenderusss@mail.ru','$2b$10$e5RKBLrYyeQ/SwsIuJrSMewALTr7jdwqdLeRN4cnjq.EO2pjfRnse','Артем Костюк',1,4,44,'2025-05-30'),('asdasdsa@mail.ru','$2b$10$01OPG7QYcwjHACgIazKQgu2Tg8N1KZaCo.CUG1E6DIyYGkT/szOwu','dsadasd sadasdasd',0,3,45,'2025-05-28'),('adasdasd@mail.ru','$2b$10$2bNmOy/uwfDIs9G4uiQTFuvOGrznnIM6LVJ0EBL0UG05WM/AdFC..','dsdsad sadasds',0,3,46,'2025-05-08'),('ddddddddd@mail.ru','$2b$10$LOzEIyPYHMsAMsl37MNMgeDQlbEtVCcCdtNWitaMJheZUTfFl8lxe','dsadasds dasdsadsad',0,3,48,'2025-05-30'),('1@mail.ru','$2b$10$O4tnTbmKFE2YA5D.m.o.JeJU7Y4kacOFqctWcN9XLskOtWP8giHSu','1 1',0,3,49,'2025-05-27'),('artem.kostywuk.2015@inbox.ru','$2b$10$reciJZHqJEYbEp9exDfBYunqtkJMpye8S8IIClcTPdzmDZi7PK4Rm','Артем Костюк',0,3,51,'2025-05-26'),('artem.kostywu2k.2015@inbox.ru','$2b$10$qjydqboqxuJjSICPU.ckM.Xn2IcSPuHjyberJZ8j8r8wFatXKz.dS','Артем Костюк',0,3,52,'2025-05-26'),('artem.kost2ywu2k.2015@inbox.ru','$2b$10$PNF9pgKy0bne5s2YcBtmie0nLhjaYog71aZAFP5lHsSMqWhwEPEyO','Артем Костюк',0,3,53,'2025-05-26'),('artem.kostyuk.2024@gmail.com','$2b$10$uA1MXa4hLPmPH8UmHhT2mu2pJTYuDobMMoVgTKPeQFaDy07aVo80e','Артем Костюк',0,3,58,'2025-05-29');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Еда'),(2,'Цветы'),(3,'Бытовая техника'),(4,'Одежда'),(5,'Косметика'),(6,'Электроника'),(7,'Спорттовары'),(8,'Книги'),(9,'Мебель'),(10,'Детские товары'),(11,'Ювелирные изделия'),(12,'Товары для дома'),(13,'Развлечения'),(16,'Доставка'),(17,'Oбувь'),(18,'Спортивная обувь');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_has_Promotions`
--

DROP TABLE IF EXISTS `category_has_Promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_has_Promotions` (
  `category_category_id` int(11) NOT NULL,
  `Promotions_Promotion_id` int(11) NOT NULL,
  PRIMARY KEY (`category_category_id`,`Promotions_Promotion_id`),
  KEY `fk_category_has_Promotions_Promotions1_idx` (`Promotions_Promotion_id`),
  KEY `fk_category_has_Promotions_category1_idx` (`category_category_id`),
  CONSTRAINT `fk_category_has_Promotions_Promotions1` FOREIGN KEY (`Promotions_Promotion_id`) REFERENCES `Promotions` (`Promotion_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_category_has_Promotions_category1` FOREIGN KEY (`category_category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_has_Promotions`
--

LOCK TABLES `category_has_Promotions` WRITE;
/*!40000 ALTER TABLE `category_has_Promotions` DISABLE KEYS */;
INSERT INTO `category_has_Promotions` VALUES (1,25),(1,26),(2,12),(5,25),(7,23),(7,27),(8,25),(10,25),(17,23),(18,23);
/*!40000 ALTER TABLE `category_has_Promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_role` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(45) NOT NULL,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `idUsers_UNIQUE` (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Гость'),(3,'Пользователь'),(4,'Администратор'),(5,'Менеджер');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userStores`
--

DROP TABLE IF EXISTS `userStores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userStores` (
  `user_id` int(11) NOT NULL,
  `Stores_id` int(11) NOT NULL,
  KEY `fk_userStores_Stores1_idx` (`Stores_id`),
  CONSTRAINT `fk_userStores_Stores1` FOREIGN KEY (`Stores_id`) REFERENCES `Stores` (`Store_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userStores`
--

LOCK TABLES `userStores` WRITE;
/*!40000 ALTER TABLE `userStores` DISABLE KEYS */;
INSERT INTO `userStores` VALUES (2,3),(42,5),(41,9),(44,13),(56,1),(57,1),(58,3);
/*!40000 ALTER TABLE `userStores` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-16 13:48:54
