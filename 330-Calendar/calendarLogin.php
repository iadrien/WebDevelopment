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

  //3. If the form is submitted or not.
  //3.1 If the form is submitted

//3.1.1 Assigning posted values to variables.
$username = test_input($_POST['username']);
$password = test_input($_POST['password']);

//3.1.2 Checking the values are existing in the database or not
$query = "select username, password from users where username=\"$username\"";

$stmt = $mysqli->prepare($query);
if(!$stmt){
  printf("Query Prep Failed: %s\n", $mysqli->error);
  echo json_encode(array(
 		success => false,
    message => "Database Connecting Failure"
 	));
  exit;
}
$truePSWD="";
$stmt->execute();
$stmt->bind_result($username,$truePSWD);
$stmt->fetch();
$stmt->close();
//echo "test password".$truePSWD;
if(password_verify($password,$truePSWD)){
  $_SESSION['logedin'] = true;
  $_SESSION['username'] = $username;

  // CRSF TOKEN

  $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32));

  echo json_encode(array(
		success => true,
    message => "successful",
    token => $_SESSION['token']
	));
	exit;
}else{
  echo json_encode(array(
		success => false,
		message => "Incorrect Username or Password"
	));
	exit;
}



function test_input($data) {
  $new_string = preg_replace("/[^A-Za-z0-9]/",'',$data);

  if($data!=$new_string){
    echo json_encode(array(
		success => false,
		message => "Input failed"
	 ));
	  exit;
  }
    return $new_string;
  }


?>
