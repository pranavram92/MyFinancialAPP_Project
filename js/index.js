document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady() {
    console.log('Running FinStir');
}

function signin1() {
    loginOBP();
    setTimeout(queryOBP, 1000); // wait for 1 second to ensure token is set
}
var failMsg = ""; // Setting empty variable for non repitition of fail message on the login page
var token;

function loginOBP() {
    var username = document.getElementById("uname").value; //converted as variables for authentication - avoiding hard coding
    var password = document.getElementById("pwd").value;
    console.log("in login");
    $.ajax({
        url: "https://apisandbox.openbankproject.com/my/logins/direct",
        type: "POST",
        dataType: "json",
        crossDomain: true,
        cache: false,
        contentType: "application/json; charset=utf-8",
        xhrFields: {
            withCredentials: true
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin username=' + username + ', password=' + password + ', consumer_key="xngfsof2ox5f3e0sy0tfwsphunz1h2ea0jk3v1jm"');
        },
        success: function (data, textStatus, jQxhr) {
            console.log("in login success");
            token = data.token;
            window.location.href = "#bankpage";
            username_display = username.substr(0, username.indexOf('.')); // The username is carved out from the first index (0) till '.'
            const welcomedisplay = document.createElement("h1");
            welcomedisplay.innerHTML = "Welcome " + username_display;
            var bankpagedisplay = document.getElementById("logout");
            bankpagedisplay.parentNode.insertBefore(welcomedisplay, bankpagedisplay.nextSibling); // Welcome message introduced in run time
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log("in error");
            if (failMsg == "") {
                failMsg = document.createElement("p");
                failMsg.innerHTML = "Username and Password mismatch. Please try again.";
                failMsg.style.color = "red";
                var loginForm = document.getElementById("logindisplaybox");
                loginForm.appendChild(failMsg); // fail message is appended to on the login page
            }
        }
    });
}

function queryOBP() {
    console.log("in query");
    $.ajax({
        url: "https://apisandbox.openbankproject.com/obp/v4.0.0/banks",
        type: "GET",
        dataType: "json",
        crossDomain: true,
        cache: false,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function (data, textStatus, jQxhr) {
            console.log("in query success");
            console.log(data);
            appendRow(data.banks); // calling appendRow function

        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log("in query error");
        }
    });
}

function appendRow(bank) {
    if (bank.length > 15) {
        const btn_banks = document.createElement("BUTTON");
        btn_banks.innerHTML = "Load More";
        btn_banks.setAttribute("id", "load-morebanks");
        var table_after = document.getElementById("tablebanks");
        table_after.parentNode.insertBefore(btn_banks, table_after.nextSibling); //Inserting my new button below the table
        let startIndex = 0;
        let endIndex = 15; // setting 15 as the limit for initial display on the page
        displayObjects(bank, startIndex, endIndex);
        btn_banks.addEventListener('click', function () {
            startIndex = endIndex; // update the start index
            endIndex += 15; // update the end index
            displayObjects(bank, startIndex, endIndex); // display the next 15 objects
            if (endIndex >= bank.length) {
                btn_banks.style.display = 'none'; // hide the button if we've reached the end of the list
            }
        });
    }
    else {
        let endIndex = bank.length; // end index set to full size of the object to display all the banks
        for (let i = 0; i < endIndex; i++) {
            $("#tablebody").append("<tr><td>" + bank[i].full_name + "</td><td><button id=viewAccs onclick= output_bank('" + bank[i].id + "')>View Accounts</button></td></tr>");
        }
    }
}

function displayObjects(bank, startIndex, endIndex) {
    if (endIndex <= bank.length) {
        for (let i = startIndex; i < endIndex; i++) {
            $("#tablebody").append("<tr><td>" + bank[i].full_name + "</td><td><button id=viewAccs onclick= output_bank('" + bank[i].id + "')>View Accounts</button></td></tr>");
        }
    }
}

function output_bank(b) {
    window.location.href = "#accpage";
    mybankid = b; // declared as global variable for concatenating on the url in another function
    $.ajax({
        url: "https://apisandbox.openbankproject.com/obp/v5.1.0/banks/" + mybankid + "/accounts/private",
        type: "GET",
        dataType: "json",
        crossDomain: true,
        cache: false,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function (data, textStatus, jQxhr) {
            console.log("in accounts success");
            console.log(data);
            appendrowaccs(data.accounts);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log("in accounts error");
        }
    });
}

function appendrowaccs(account) {
    if (account.length > 15) {
        const btn_accs = document.createElement("BUTTON");
        btn_accs.innerHTML = "Load More";
        btn_accs.setAttribute("id", "load-moreAccs");
        var AccPage = document.getElementById("accpage");
        var table_after = document.getElementById("table2");
        table_after.parentNode.insertBefore(btn_accs, table_after.nextSibling); //Inserting my new button below the table
        var loadMoreButton_Accs = document.getElementById('load-moreAccs');
        let startIndex = 0;
        let endIndex = 15; // setting 15 as the limit for initial display on the page
        displayObjectsAccs(account, startIndex, endIndex);
        loadMoreButton_Accs.addEventListener('click', function () {
            startIndex = endIndex; // update the start index
            endIndex += 15; // update the end index
            displayObjectsAccs(account, startIndex, endIndex); // display the next 15 objects
            if (endIndex >= account.length) {
                loadMoreButton_Accs.style.display = 'none';  // hide the button if we've reached the end of the list
            }
        });
    }
    else {
        let endIndex = account.length; // end index set to full size of the object to display all the accounts
        for (let i = 0; i < endIndex; i++) {
            $("#tablebody2").append("<tr><td>" + account[i].id + "</td><td>" + account[i].account_type + "</td><td><button id=viewAccs onclick= output_accs()>View Transactions</button></td></tr>");
            accid = account[i].id;
        }
    }
}

function displayObjectsAccs(account, startIndex, endIndex) {
    if (endIndex <= account.length) {
        for (let i = startIndex; i < endIndex; i++) {
            $("#tablebody2").append("<tr><td>" + account[i].id + "</td><td>" + account[i].account_type + "</td><td><button id=viewAccs onclick= output_accs()>View Transactions</button></td></tr>");
            accid = account[i].id; // declared as global variable for concatenating on the url in another function
        }
    }
}

function deleteTable1() {
    $("#tablebody2").empty(); // clearing the contents of the table
    if ($('#load-moreAccs').length > 0) {
        const lmAccs = document.getElementById('load-moreAccs');
        lmAccs.remove(); //removing load more button
    }
}

function output_accs() {
    window.location.href = "#txnpage";
    $.ajax({
        url: "https://apisandbox.openbankproject.com/obp/v5.1.0/my/banks/" + mybankid + "/accounts/" + accid + "/transactions",
        type: "GET",
        dataType: "json",
        crossDomain: true,
        cache: false,
        contentType: "application/json; charset=utf-8",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", 'DirectLogin token=' + token);
        },
        success: function (data, textStatus, jQxhr) {
            console.log("in transactions success");
            console.log(data);
            appendrowtxns(data.transactions);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log("in transactions error");
        }
    });
}

function appendrowtxns(transaction) {
    if (transaction.length > 15) {
        const btn_txns = document.createElement("BUTTON");
        btn_txns.innerHTML = "Load More";
        btn_txns.setAttribute("id", "load-moreTxns");
        var table_after2 = document.getElementById("table3");
        table_after2.parentNode.insertBefore(btn_txns, table_after2.nextSibling); //Inserting my new button below the table
        let startIndex = 0;
        let endIndex = 15; // setting 15 as the limit for initial display on the page
        displayObjectsTxns(transaction, startIndex, endIndex);
        btn_txns.addEventListener('click', function () {
            startIndex = endIndex; // update the start index
            endIndex += 15; // update the end index
            displayObjectsTxns(transaction, startIndex, endIndex); // display the next 15 objects
            if (endIndex >= transaction.length) {
                btn_txns.style.display = 'none'; // hide the button if we've reached the end of the list
            }
        });
    }
    else {
        let endIndex = transaction.length; // end index set to full size of the object to display all the transactions
        for (let i = 0; i < endIndex; i++) {
            $("#tablebody3").append("<tr><td>" + transaction[i].details.description + "</td><td>" + transaction[i].details.value.amount + "</td><td>" + transaction[i].details.value.currency + "</td></tr>");
        }
    }
}

function displayObjectsTxns(transaction, startIndex, endIndex) {
    if (endIndex <= transaction.length) {
        for (let i = startIndex; i < endIndex; i++) {
            $("#tablebody3").append("<tr><td>" + transaction[i].details.description + "</td><td>" + transaction[i].details.value.amount + "</td><td>" + transaction[i].details.value.currency + "</td></tr>");
        }
    }
}

function deleteTable2() {
    $("#tablebody3").empty(); // clearing the contents of the table
    if ($('#load-moreTxns').length > 0) {
        const lm2 = document.getElementById('load-moreTxns');
        lm2.remove(); // removing load more button
    }
}

function logoff() {
    window.location.href = "#loginpage";
    localStorage.removeItem(token); // clear authentication credentials 
    window.localStorage.clear();
    window.location.reload(true);
    token = "";
}