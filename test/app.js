let candidates = {"Rama": "candidate-1", "Nick": "candidate-2", "Jose": "candidate-3"}

$(document).ready(function() {
	//初始化余额
	candidateNames = Object.keys(candidates);
 	for (var i = 0; i < candidateNames.length; i++) {
		let voteName = candidateNames[i];
  		totalVotesFor(voteName); 	
	}

 	//初始化事件
 	$(".vote-btn").click(function(){
 		//获取投票人名称
 		let voteName=$(this).prev().prev().text();
 		voteForCandidate(voteName);

 	});
});

function totalVotesFor(voteName) {
    $.get("/totalVotesFor?voteName=" + voteName, function(data) {
		if(data == "Error") {
            alert('提示', '500');
        } else {
			$("#"+candidates[voteName]).html(data);
		}
    });
}

function voteForCandidate(voteName) {
    $.get("/voteForCandidate?voteName=" + voteName, function(data) {
        if(data == "Error") {
            alert('提示', '500');
        } else {
           let div_id = candidates[voteName];
		   var vote_num = totalVotesFor(voteName);
		   $("#"+div_id).html(data);//.fadeIn(800);
		   $("#"+div_id);//.fadeOut(400);
        }
    });
}
