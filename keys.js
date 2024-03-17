$.fn.scrollView = function () {
	return this.each(function () {
		$('html, body').animate({
			scrollTop: $(this).offset().top
		});
	});
}

$('#Biography').click().scrollView();
$('#Teaching').click().scrollView();
$('#Repertoire').click().scrollView();
$('#Recordings').click().scrollView();
$('#Contact').click().scrollView();
