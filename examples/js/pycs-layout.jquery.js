(function($) {

    $.fn.pycsLayout = function(options) {

	var settings = $.extend({
	    pictureContainer: ".picture",
	    preserveHeight: false,
	    idealHeight: 150,
	    gutter: 6,
	    animate: true
        }, options);
	

	/**
	   Thanks Florian Maul for this great piece of code:
	   http://www.techbits.de/2011/10/25/building-a-google-plus-inspired-image-gallery/

	   This algorithm keep the height of the images.
	*/
	var preserveHeight = function(containerWidth, items){
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
		    var fractOfLen = parseInt($(item).attr("data-width")) / len;
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
		var marginsOfImage = parseInt(settings.gutter);

		// Build a row of images until longer than maxwidth
		while(items.length > 0 && len < maxwidth) {
		    var item = items.shift();
		    row.push(item);
		    len += (parseInt($(item).attr("data-width")) + marginsOfImage);
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
			item_twidth = parseInt($(item).attr("data-width"));

			// move the left border inwards by half the pixels
			$(item).attr("data-vx", Math.floor(pixelsToRemove / 2));

			// shrink the width of the image by pixelsToRemove
			$(item).attr("data-vwidth", item_twidth - pixelsToRemove);
			$(item).attr("data-vheight", $(item).attr("data-height"));
		    }
		} else {
		    // all images fit in the row, set vx and vwidth
		    for(var i in row) {
			item = row[i];
			$(item).attr("data-vx", "0");
			$(item).attr("data-vwidth", $(item).attr("data-width"));
			$(item).attr("data-vheight", $(item).attr("data-height"));
		    }
		}

		return row;
	    };

	    // calculate rows of images whith each row fitting into
	    // the specified windowWidth.
	    var rows = [];
	    while(items.length > 0) {
		rows.push(buildImageRow(containerWidth, items));
	    }
	    return rows;
	}

	
	/**
	   Thanks Johannes Treitz for this one.
	   http://www.crispymtn.com/stories/the-algorithm-for-a-perfectly-balanced-photo-gallery

	   This algorithm reorganises the photo to optimize the distribution
	   of the pictures inside the container.
	 */
	var chromatic = function(containerWidth, items){

	    var zero_tab = function(n, k){
		/* intialise the array with zero */
		var table = [];
		for(var i=0; i<n; i++){
		    table[i] = [];
		    for(var j=0; j<k; j++){
			table[i][j] = 0;
		    }
		}
		return table;
	    };
	    
	    var linear_partition = function(seq, k){
		n = seq.length;

		if(k <= 0){
		    return [];
		}
		if(k > n){
		    return seq.map(function(x){
			return [x];
		    });
		}

		var table = zero_tab(n, k);
		var solution = zero_tab(n, k);

		/* build the partition tables */
		for(var i=0; i<n; i++){
		    table[i][0] = seq[i];
		    if(i>0){
			table[i][0] += table[i-1][0];
		    }
		}
		for(var j=0; j<k; j++){
		    table[0][j] = seq[0];
		}

		for(var i=1; i<n; i++){
		    for(var j=1; j<k; j++){
			var m = [Math.max(table[0][j-1], table[i][0] - table[0][0])];
			m.push(0);
			for(var x=0; x<i; x++){
			    var max=Math.max(table[x][j-1], table[i][0] - table[x][0]);
			    if(max < m[0]){
				m = [max, x];
			    }
			}
			table[i][j] = m[0];
			solution[i-1][j-1] = m[1];
		    }
		}

		n = n-1;
		k = k-2;
		ans = [];
		while(k >= 0){
		    var p = [];
		    if(n>0){
			for(var i=solution[n-1][k]+1; i<n+1; i++){
			    p.push(seq[i]);
			}
		    
			ans = [p].concat(ans);
			n = solution[n-1][k];
		    }
		    k = k-1;
		}
		var p = [];
		for(var i=0; i<n+1; i++){
		    p.push(seq[i]);
		}
		return [p].concat(ans);
	    }
	    
	    /* 
	       Compute aspect ratios for each picture and store it as an 
	       attribute.
	       It also compute the width of the picture after reducing its height to
	       idealHeight.
	     */
	    var get_aspect_ratios = function(items){
		aspect_ratios = [];
		for(var i=0; i<items.length; i++){
		    var width = parseInt($(items[i]).attr("data-width"));
		    var height = parseInt($(items[i]).attr("data-height"));
		    var ar = width/height;
		    var new_width = ar * settings.idealHeight;
		    $(items[i]).attr("data-vwidth", new_width);
		    $(items[i]).attr("data-vheight", settings.idealHeight);
		    $(items[i]).attr("data-aspect-ratio", ar);
		    aspect_ratios.push(parseInt(ar*100));
		}
		return aspect_ratios;
	    }

	    var totalWidth = 0;
	    var weights = get_aspect_ratios(items);
	    var rows_number = 0;
	    var rows = [];

	    for(var i=0; i<items.length; i++){
		totalWidth += (parseInt($(items[i]).attr("data-vwidth")) + 
			       settings.gutter);
	    }
	    
	    rows_number = Math.round(totalWidth / containerWidth);

	    partition = linear_partition(weights, rows_number);

	    /* build the rows and resize the images */
	    var index = 0;
	    for(var i=0; i<partition.length; i++){
		rows[i] = [];		    
		var summed_ratios = 0;
		for(var j=0; j<partition[i].length; j++){
		    summed_ratios += parseFloat($(items[index]).attr("data-aspect-ratio"));
		    rows[i][j] = items[index];
		    index++;
		}
		for(var j=0; j<rows[i].length; j++){
		    var vwidth = containerWidth / summed_ratios;
		    vwidth *= parseFloat($(rows[i][j]).attr("data-aspect-ratio"));
		    vwidth = parseInt(vwidth) - (settings.gutter);
		    var vheight = parseInt(((containerWidth-rows[i].length*settings.gutter) / summed_ratios));
		    $(rows[i][j]).attr("data-vwidth", vwidth);
		    $(rows[i][j]).attr("data-vheight", vheight);
		}
	    }
	    
	    return rows;
	}

	var showImages = function(imageContainer, realItems) {

	    // reduce width by 1px due to layout problem in IE
	    var containerWidth = imageContainer.width() - 1;
	    // Make a copy of the array
	    var items = $.extend(true, [], realItems);
	    var rows = null;

	    if(settings.preserveHeight){
		rows = preserveHeight(containerWidth, items);
	    }else{
		rows = chromatic(containerWidth, items);
	    }
	   
	    for(var r in rows) {
	    	for(var i in rows[r]) {		    
	    	    var item = rows[r][i];
		    $(item).css({
			"margin": parseInt(settings.gutter/2) + "px",
			"float": "left",
			"position": "relative",
			"width": $(item).attr("data-vwidth") + "px",
			"height": $(item).attr("data-vheight") + "px",

			//"display": "inline-block"
		    });
		     $('img', item).css({
		     	 "width": $(item).attr("data-vwidth") + "px",
		     	 "height": $(item).attr("data-vheight") + "px",	
		     	 "margin-top": "0px",
		     });		    
		    imageContainer.append($(item));		    
		    if(settings.animate){
			$(item).animate({opacity: 1}, 1000);
		    }else{
			$(item).css({"opacity": 1});
		    }
	    	}
	    }	    
	};

	var $this = $(this);

	if($(this).length > 0){
	    $(this).each(function(){
		if(settings.animate){
		    $(settings.pictureContainer, $(this)).css("opacity", "0");
		}
		showImages($(this), $(settings.pictureContainer, $(this)));
	    });

	    /* let 100ms before recalculate everything on resizing */
	    var doit;
	    window.onresize = function(){
		clearTimeout(doit);
		doit = setTimeout(function(){
		    $this.each(function(){			
			showImages($(this), $(settings.pictureContainer, $(this)));
		    });
		}, 100);
	    }
	}
	return $this;
    };

}(jQuery));