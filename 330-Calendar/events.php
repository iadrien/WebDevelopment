<?php

ini_set("session.cookie_httponly", 1);
session_start();
header('Content-type: application/json');

  if($_SESSION['logedin']!=true){
    $event = array();
    $myarray = array("event"=>$event);
    echo json_encode($myarray);
    exit;
  }

  $year = $_GET["year"];
  $month = $_GET["month"];
  $user = $_SESSION["username"];

	$mysqli = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calender');

	if($mysqli->connect_errno) {
		printf("Connection Failed: %s\n", $mysqli->connect_error);
		exit;
	}else{
		//fetch the story by story id
		$stmt = $mysqli->prepare("select eventid, day, eventtitle from events where year = \"$year\" AND month=\"$month\" and username=\"$user\"");

    if(!$stmt){
			printf("Query Prep Failed: %s\n", $mysqli->error);
			exit;
		}

    $event=array();
		$stmt->execute();
		$stmt->bind_result($eventid, $day, $title);
	  while($stmt->fetch()){
      $temp = array( "id" => (string)$eventid, "day" => (string)$day, "title"=>(string)$title);
      $event[]=$temp;
    }
	  $stmt->close();

    $myarray = array("event"=>$event);

    echo json_encode($myarray);

	}

?>
