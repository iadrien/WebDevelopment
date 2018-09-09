function loginAjax(event){
        var username = document.getElementById("lusername").value;
        var password = document.getElementById("lpassword").value;

        var dataString = "username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "calendarLogin.php", true);

        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xmlHttp.addEventListener("load", function(event){
                var jsonData = JSON.parse(event.target.responseText);

                if(jsonData.success){
                  //alert(jsonData.token);
                        alert("Login successful.");
                        close();
                        document.getElementById("token").value = jsonData.token;
                        checkstatus();
                        update();

                          //alert(document.getElementById("token").value);
                }else{
                        alert("Login failed. "+ jsonData.message);
                }
        }, false);
        xmlHttp.send(dataString);
}

document.getElementById("login").addEventListener("click", loginAjax, false); //create id register
