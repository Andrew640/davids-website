// function parallaxScroll(){
// 	var scrolled = $(window).scrollTop();
// 	$('#header').css('top',(0-(scrolled*.25))+'px');
// 	// $('#parallax-bg2').css('top',(0-(scrolled*.5))+'px');
// 	// $('#parallax-bg3').css('top',(0-(scrolled*.75))+'px');
// }

$.fn.scrollView = function () {
	return this.each(function () {
		$('html, body').animate({
			scrollTop: $(this).offset().top
		});
	});
}

$('#Biography').click().scrollView();
$('#Recitals').click().scrollView();
$('#Photos').click().scrollView();
$('#Teaching').click().scrollView();
$('#Recordings').click().scrollView();
$('#Contact').click().scrollView();
