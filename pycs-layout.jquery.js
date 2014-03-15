/*
Thanks Florian Maul for this great piece of code:
http://www.techbits.de/2011/10/25/building-a-google-plus-inspired-image-gallery/

*/


var PycsGallery = (function($) {

    /** Utility function that returns a value or the defaultvalue if the value 
	is null
    */
    var $nz = function(value, defaultvalue) {
	if( typeof (value) === undefined || value == null) {
	    return defaultvalue;
	}
	return value;
    };
    
    /**
     * Distribute a delta (integer value) to n items based on
     * the size (width) of the items thumbnails.
     * 
     * @method calculateCutOff
     * @property len the sum of the width of all thumbnails
     * @property delta the delta (integer number) to be distributed
     * @property items an array with items of one row
     */
    var calculateCutOff = function(len, delta, items) {
	// resulting distribution
	var cutoff = [];
	var cutsum = 0;

	// distribute the delta based on the proportion of
	// thumbnail size to length of all thumbnails.
	for(var i in items) {
	    var item = items[i];
	    var fractOfLen = parseInt($('img', item).attr("data-width")) / len;
	    cutoff[i] = Math.floor(fractOfLen * delta);
	    cutsum += cutoff[i];
	}

	// still more pixel to distribute because of decimal
	// fractions that were omitted.
	var stillToCutOff = delta - cutsum;
	while(stillToCutOff > 0) {
	    for(i in cutoff) {
		// distribute pixels evenly until done
		cutoff[i]++;
		stillToCutOff--;
		if (stillToCutOff == 0) break;
	    }
	}
	return cutoff;
    };
    
    /**
     * Takes images from the items array (removes them) as 
     * long as they fit into a width of maxwidth pixels.
     *
     * @method buildImageRow
     */
    var buildImageRow = function(maxwidth, items) {
	var row = [], len = 0;
	
	// each image a has a 3px margin, i.e. it takes 6px additional space
	var marginsOfImage = 6;

	// Build a row of images until longer than maxwidth
	while(items.length > 0 && len < maxwidth) {
	    var item = items.shift();
	    row.push(item);
	    len += (parseInt($('img', item).attr("data-width")) + marginsOfImage);
	}

	// calculate by how many pixels too long?
	var delta = len - maxwidth;

	// if the line is too long, make images smaller
	if(row.length > 0 && delta > 0) {

	    // calculate the distribution to each image in the row
	    var cutoff = calculateCutOff(len, delta, row);

	    for(var i in row) {
		var pixelsToRemove = cutoff[i];
		item = row[i];
		item_twidth = parseInt($('img', item).attr("data-width"));

		// move the left border inwards by half the pixels
		$('img', item).attr("data-vx", Math.floor(pixelsToRemove / 2));

		// shrink the width of the image by pixelsToRemove
		$('img', item).attr("data-vwidth", item_twidth - pixelsToRemove);
	    }
	} else {
	    // all images fit in the row, set vx and vwidth
	    for(var i in row) {
		item = row[i];
		$('img', item).attr("data-vx", "0");
		$('img', item).attr("data-vwidth", $('img', item).attr("data-width"));
	    }
	}

	return row;
    };

    return {
	
	showImages : function(imageContainer, realItems) {
	    // reduce width by 1px due to layout problem in IE
	    var containerWidth = imageContainer.width() - 1;
	    
	    // Make a copy of the array
	    var items = realItems.slice();
	    
	    // calculate rows of images which each row fitting into
	    // the specified windowWidth.
	    var rows = [];
	    while(items.length > 0) {
		rows.push(buildImageRow(containerWidth, items));
	    }  

	    for(var r in rows) {
	    	for(var i in rows[r]) {
	    	    var item = rows[r][i];
		    $(item).css({
			"width": $('img', item).attr("data-vwidth") + "px",
			"height": $('img', item).attr("data-height") + "px",
			
		    });
		     $('img', item).css({
		     	 "width": $('img', item).attr("data-width") + "px",
		     	 "height": $('img', item).attr("data-height") + "px",
		     	 "margin-left": "" + ($('img', item).attr("data-vx") ? (-$('img', item).attr("data-vx")) : 0) + "px",
		     	 "margin-top": "0px",
		     });
		    imageContainer.append($(item));
		    $(item).animate({opacity: 1}, 500);
	    	}
	    }
	}
    }
})(jQuery);

$(document).ready(function() {
    
    $(".gallery").each(function(index, element){
	var pictures = $(".picture", element);
	var pictures_array = $.makeArray(pictures);
	PycsGallery.showImages($(element), pictures_array);
    });

	
    $(window).resize(function() {
	$(".gallery").each(function(index, element){
	    var pictures = $(".picture", element);
	    var pictures_array = $.makeArray(pictures);
	    PycsGallery.showImages($(element), pictures_array);
	});
    });  
});

