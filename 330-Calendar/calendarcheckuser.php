<?php
ini_set("session.cookie_httponly", 1);
session_start();

if($_SESSION['logedin']==true){

	if(!hash_equals($_SESSION['token'], $_POST['token'])){
		echo json_encode(array(
			success => false
		));

		$_SESSION['logedin']=false;
		exit;
	}
	echo json_encode(array(
		success => true
	));
	exit;
}else{
	echo json_encode(array(
		success => false
	));
	$_SESSION['logedin']=false;
	exit;
}

?>
