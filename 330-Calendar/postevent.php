<?php
ini_set("session.cookie_httponly", 1);
session_start();
header('Content-type: application/json');

if($_SESSION['logedin']!=true){
  echo json_encode(array(
 		success => false,
    message => "Log in to perform!"
 	));
  exit;
}


//check the totken
if(!hash_equals($_SESSION['token'], $_POST['token'])){
  echo json_encode(array(
    success => false,
    message => "Don't mess with request forgery!",
    token1 => $_SESSION['token'],
    token2 => $_POST['token']
  ));
  exit;
}


$mysqli = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calender');

if($mysqli->connect_errno) {
  echo json_encode(array(
    success => false,
    message => "database connection error"
  ));
  exit;
}else{

  $eventtitle=  $_POST["title"];
  $description=$_POST["description"];
  $year = $_POST["year"];
  $month = $_POST["month"];
  $day = $_POST["day"];
  $time = $_POST["time"];
  $username = $_SESSION["username"];

  //insert comment
  $q="insert into events (eventtitle, eventdescription, time,day,month,year,username) VALUES (\"$eventtitle\", \"$description\", \"$time\",\"$day\",\"$month\",\"$year\",\"$username\");";

  $stmt = $mysqli->prepare($q);
  if(!$stmt){
    echo json_encode(array(
      success => false,
      message => "Query failure!"
    ));
    exit;
  }

  $stmt->execute();
  $stmt->close();
  echo json_encode(array(
    success => true,
    message => "Yay!"
  ));
  exit;

}
?>
