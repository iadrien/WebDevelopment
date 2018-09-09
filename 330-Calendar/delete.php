<?php
ini_set("session.cookie_httponly", 1);
session_start();
header('Content-type: application/json');

$mysqli = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calender');

if($mysqli->connect_errno) {
  printf("Connection Failed: %s\n", $mysqli->connect_error);
  echo json_encode(array(
 		success => false,
    message => "Database Connecting Failure"
 	));
  exit;
}


if (isset($_SESSION["username"])){
  $username = $_SESSION["username"];
  $id=$_GET["id"];
  $stmt = $mysqli->prepare("select eventtitle, eventdescription, time from events where username =\"$username\" and eventid=\"$id\"");
  if(!$stmt){
      printf("Query Prep Failed: %s\n", $mysqli->error);
      echo json_encode(array(
        success => false,
        message => "Query Failure"
      ));
      exit;
  }

  $stmt->bind_result($title, $description, $time);
  $stmt->execute();
  $stmt->fetch();
  $stmt->close();

  if(isset($title,$description,$time)){
    $stmt = $mysqli->prepare("delete from events where eventid=\"$id\"");
    if(!$stmt){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        echo json_encode(array(
          success => false,
          message => "Query Failure"
        ));
        exit;
    }

    $stmt->execute();
    $stmt->close();
  }else{
    echo json_encode(array(
      success => false,
      message => "No such event"
    ));
    exit;
  }

}else{
  echo json_encode(array(
 		success => false,
     message => "Please Login"
 	));
 	exit;
}
?>
