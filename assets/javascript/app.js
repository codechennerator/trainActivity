 var config = {
    apiKey: "AIzaSyA88nEyhePVdgD2lEWoCgRrNxgQXDwNhe4",
    authDomain: "train-activity-bd97c.firebaseapp.com",
    databaseURL: "https://train-activity-bd97c.firebaseio.com",
    projectId: "train-activity-bd97c",
    storageBucket: "train-activity-bd97c.appspot.com",
    messagingSenderId: "286463972054"
 };
 firebase.initializeApp(config);

var defaultDatabase = firebase.database();


//Event happens once
var childListener = false;
//Database clarity
var ref = defaultDatabase.ref();
var filter = ref.orderByChild('dateAdded').limitToLast(1);


function createTable(info){
	console.log(info);
	var trainFreq = parseInt(info.frequency);
	var now = moment();
	var firstTime = moment(info.firstTrain, "HH:mm").subtract(1, "days");

	var differenceInTime = now.diff(moment(firstTime), "minutes");
	console.log("differenceInTime var: " + differenceInTime);
	var remainder = differenceInTime % trainFreq;
	console.log("remainder var: " + remainder);
	var minutesToNextTrain = trainFreq - remainder;
	

	var nextTrain = now.add(minutesToNextTrain, "minutes").format('hh:mm A');
	
	$('#trainTable').append(
		'<tr>' +
		'<td>' + info.trainName + '</td>' +
		'<td>' + info.destination + '</td>' +
		'<td>' + info.frequency + '</td>' +
		'<td>' + nextTrain + '</td>' +
		'<td>' + minutesToNextTrain + '</td>' +
		'</tr>'
	);
}

defaultDatabase.ref().once("value", function(snapshot) {
	snapshot.forEach(function(child){
		createTable(child.val());
	});
});

filter.on('child_added',function(snapshot){
	if(childListener){
		var info = snapshot.val();
		createTable(info);
	}
});

$('#run-submit').on('click',function(event){

	event.preventDefault();

	if ($('#trainName').val().trim() != ''){
		if(!childListener) childListener = true;
		var trainIn = $('#trainName').val().trim();
		var destinationIn = $('#destination').val().trim();
		var firstTimeIn = $('#firstTrainTime').val().trim();
		var frequencyIn = $('#frequency').val().trim();


		var newTrain = {
			trainName: trainIn,
			destination: destinationIn,
			firstTrain: firstTimeIn,
			frequency: frequencyIn,
			dateAdded: firebase.database.ServerValue.TIMESTAMP
		}

		defaultDatabase.ref().push(newTrain);

		$('#trainName').val('');
		$('#destination').val('');
		$('#firstTrainTime').val('');
		$('#frequency').val('');
	}
});