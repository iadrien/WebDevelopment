<?php
ini_set("session.cookie_httponly", 1);
session_start();
header('Content-type: application/json');


	if($_POST["username"]!="" && $_POST["password1"]!="" && $_POST["password2"]!=""){
		//check to see if password fields match
		if ($_POST["password1"] == $_POST["password2"]){

        $mysqli = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calender');

        if($mysqli->connect_errno) {
          printf("Connection Failed: %s\n", $mysqli->connect_error);
					echo json_encode(array(
						success => false,
						message => "Failure Connecting"
					));
          exit;
        }

    		$x = test_input($_POST['username']);
    		$y = test_input($_POST['password2']);

        if($x==""){

			    echo json_encode(array(
					success => false,
					message => "Incorrect Username"
					));
					exit;
        }else if($y==""){

          echo json_encode(array(
						success => false,
						message => "Incorrect Password"
					));
					exit;
        }

        // check if the username is already taken
        $stmt = $mysqli->prepare("select username from users where username =\"$x\"");
    		if(!$stmt){
    		    printf("Query Prep Failed: %s\n", $mysqli->error);
						echo json_encode(array(
							success => false,
							message => "Query Failure"
						));
    		    exit;
    		}

    		$stmt->bind_result($exist);

    		$stmt->execute();
        $stmt->fetch();
    		$stmt->close();

        if($exist!=""){

          echo json_encode(array(
						success => false,
						message => "Username already taken"
					));
					exit;
        }



    		$hash = password_hash($y,PASSWORD_DEFAULT);

    		$stmt = $mysqli->prepare("insert into users (username, password) values (\"$x\", \"$hash\");");
      	if(!$stmt){
      		printf("Query Prep Failed: %s\n", $mysqli->error);
					echo json_encode(array(
						success => false,
						message => "Saving registration failure!"
					));
      		exit;
      	}

    		$stmt->bind_param('ss', $x, $hash);
    		$stmt->execute();
    		$stmt->close();

				//
				echo json_encode(array(
			 		success => true,
			     message => "successful"
			 	));
			 	exit;
				//header("location:calendarLogin.html");


			}else{

	      echo json_encode(array(
					success => false,
					message => "Passwords do not match"
				));
				exit;
	  	}
	}else{

		echo json_encode(array(
		success => false,
		message => "Incorrect Username or Password"
		));
		exit;
	}

  // filtering the inputs
	function test_input($data) {

    $new_string = preg_replace("/[^A-Za-z0-9]/",'',$data);

    if($data!=$new_string){

			echo json_encode(array(
			success => false,
			message => "Incorrect Username or Password"
			));
      exit;
    }
		  return $new_string;

	}

?>
