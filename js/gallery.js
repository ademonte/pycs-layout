$(document).ready(function(){
    $(document).foundation();

    var images_loaded = 0;
    var total_images = $(".gallery img").length;
    var percent_slice = 100 / total_images;
    var current_percent = 0;

    $(".gallery img").one("load", function() {
        images_loaded++;
        current_percent += percent_slice;
        if(images_loaded == total_images){
            $(".gallery").pycsLayout({
	        gutter: 4,
	        idealHeight: 400,
            });
            $(".loader-wrapper").hide();
        }
    }).each(function() {
        if(this.complete){
            $(this).load();
        }
    });
});
