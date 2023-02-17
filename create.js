$make = str => document.createElement(str)
var pdfPages = [];
var watermark='';
var oriSize=0, compSize=0;
function addPdfPage(index, page) {

	var impl = $make("div");
	impl.id = 'img'+index;
	impl.style.backgroundImage = "url(" + page + ")";
	impl.classList.add("block");
	impl.dataset.pagesrc = page;
	impl.dataset.index = index;
	var img = new Image();

	img.onload = e => {
		pdfPages.push({
			src: page,
			height: img.height,
			width: img.width
		});

	}
	img.src = page;
	impl.innerHTML = '<button class="btn-del" onclick="removeDiv('+index+')">Delete</button>'+
	' <button class="btn-crop" onclick="cropperImg('+index+')">Crop</button> '+
	'<a class="btn-downld" href="'+page+'" download="compress-img-'+index+'.png">Download</a>'+
	'<input type="hidden" value="'+page+'" id="imgBase64'+index+'"/>'+
	' <button class="btn-b64" onclick="copyBase64('+index+')">Copy Base64 Img</button> '+
		'<br><small style="color: white;background-color: #032121;font-size: 0.7em;">'+oriSize+' | '+compSize+'</small> ';

	$("#caller_to_cam").remove();
	$("#tray_for_pgs").append(impl);
	var adder = $make("div");
	adder.classList.add("block", "adder_to_page_pdf");
	adder.setAttribute("onclick", "callCam()");
	$("div.main.block_disp").append(adder);
	adder.id = "caller_to_cam"
	adder.style.backgroundSize = "50px 50px"

}

function cropperImg(id)
{	
	var src = document.querySelector('#img'+id).getAttribute("data-pagesrc");
	makeInterfaceCropper(src, id);
}

function removeDiv(id){
	var element = document.getElementById("img"+id);
	element.remove();	
	delete pdfPages[id];
}

function arrayRemove(arr, value) { 
    
	return arr.filter(function(ele){ 
		return ele != value; 
	});
}


callCam = () => {
	$("#uploader").click()
}

function syncCreatePage() {
	var pgl = 0;
	pdfPages.forEach(page => {

		var impl = $make("div");
		impl.id = 'img'+pgl;
		impl.dataset.id = pgl;
		impl.style.backgroundImage = "url(" + page.src + ")";
		impl.dataset.pagesrc = page.src;
		impl.dataset.index = pgl;
		var index = pgl;
		pgl += 1;
		impl.classList.add("block");		
		impl.innerHTML = '<button class="btn-del" onclick="removeDiv('+index+')">Delete</button> '+
		'<button class="btn-crop" onclick="cropperImg('+index+')">Crop</button>'+
		'<a href="'+page.src+'" class="btn-downld" download="compress-img-'+index+'.png">Download</a>'+
		'<input type="hidden" value="'+page.src+'" id="imgBase64'+index+'"/>'+
		' <button class="btn-b64" onclick="copyBase64('+index+')">Copy Base64 Img</button> '+
		'<br><small style="color: white;background-color: #032121;font-size: 0.7em;">'+oriSize+' | '+compSize+'</small> ';

		$("#caller_to_cam").remove();
		$("#tray_for_pgs").append(impl);
		var adder = $make("div");
		adder.classList.add("block", "adder_to_page_pdf");
		adder.setAttribute("onclick", "callCam()");
		$("div.main.block_disp").append(adder);
		
		adder.id = "caller_to_cam"
		adder.style.backgroundSize = "50px 50px"
	});


}

function uploader(elem) {	
	console.log("change occured")
	let ind = pdfPages.length || 0;
	Object.values(elem.files).forEach(file => {		
		var reader = new FileReader();
		reader.onloadend = function() {
		    var size = file.size / 1024000;
		    oriSize = size.toFixed(2);
		    oriSize = 'Original Size: '+oriSize+'Mb';
			if (reader.result.includes("image/png") || reader.result.includes("image/jpg") || reader.result.includes("image/jpeg")) {
				compressImage(file,function(a){
				    var stringLength = a.length - 'data:image/png;base64,'.length;
                    var sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;
                    var sizeInKb = sizeInBytes/1000;
                    compSize = 'Compressed Size: '+(sizeInKb/1024).toFixed(2)+'Mb';
					addPdfPage(ind, a);
					document.getElementById("progress").value = 0;
					ind++;
				});
				
			} else {
				$("#toast").MaterialSnackbar.showSnackbar({
					message: "this file is not supported ~ " + file.name
				});
			}

		}
		reader.readAsDataURL(file);

	});
}

makeInterfaceCropper = (src, index) => {
	var cropper;
	Ted().alert({
		title: 'Crop Image',
		html: true,
		content: `
  				<img src=${src} style="max-width:70vw; height:auto;" id="cropper-js-impl">
  				`,
		btns: [{
			val: "Crop",
			fun: e => {
				var img = new Image();
				img.onload = () => {
					pdfPages[index].src = cropper.getCroppedCanvas().toDataURL();
					pdfPages[index].height = img.height;
					pdfPages[index].width = img.width;
					$("button#pdf-create").click();
					del(e);
				};
				img.src = cropper.getCroppedCanvas().toDataURL();
			}
		}]
	})
	cropper = new Cropper($("#cropper-js-impl"));
}
window.jsPDF = window.jspdf.jsPDF

var prerenderPdf = () => {
	if(pdfPages.length > 0) {

		$(".loader").style.opacity = "1";
		$(".loader").style.zIndex = "500"
		setTimeout(renderPdf, 100);

	}else{

		Ted().alert({
			title: "Info",
			content: 'Please Add one or more image file',
			closeBtn: true
		});

	}

}
var renderPdf = () => {

	var doc = new jsPDF("p", "mm", "a4");
	if(pdfPages.length > 0) {
		for (let page of pdfPages) {
			if(page!= undefined){
				let max = {
						h: 290,
						w: 200
					},
					height, width, mrg;

				if (max.h < page.height || max.w < page.width) {
					// 1 mm = 3.7 px
					let h = page.height / 3.7,
						w = page.width / 3.7;
					//console.log("bef h w", h, w, page)
					if (h > w) {
						mrg = 0;
						rat = h / w;
						h = max.h;
						w = h / rat;
						//console.log("height>width", page, "h", h, "w", w)
					} else if (w >= h) {
						mrg = 5;
						rat = w / h;
						w = max.w;
						h = w / rat;
						//console.log("height<width", page, "h", h, "w", w)
					}
					height = h, width = w;
				} else {
					height = page.height;
					width = page.width;
				}

				doc.addImage(page.src, "png", mrg, 5, width, height);
				doc.addPage("p", "mm", "a4");
			}

		}
		Ted().alert({
			title: "Save as PDF",
			html: true,
			content: `
				<input  type="text" id="name_here" placeholder="Insert File Name..." style="width:30vw;border:0;box-shadow: 0 0 0 1px #6c6c6c, 0 1px 1px #efe;outline:none;background:transparent;color:var(--txt-c);" oninput="correctIt(this)">
									`,
			btns: [{
				val: "Save",
				fun: e => {
					doc.setTextColor(102, 16, 242)
					doc.setFontSize(10)
					
					doc.save($("#name_here").value + ".pdf");
					sessionStorage.currName = $("#name_here").value + ".pdf";
					$(".loader").style.opacity = "";
					$(".loader").style.zIndex = "";

					del(e);
					pdfPages = [];
					$("button#pdf-create").click();
				}
			}, {
				val: "Cancel",
				fun: e => {
					$(".loader").style.opacity = "";
					$(".loader").style.zIndex = "";

					del(e);


				}
			}],
			closeBtn: false
		})
	}

}

function correctIt(obj) {
	let notAllowed = `*"?/* .'\[]:;|,`;
	notAllowed = notAllowed.split("");
	for (let chara of notAllowed) {
		if (obj.value.includes(chara)) {
			obj.value = obj.value.replaceAll(chara, "_");

			navigator.vibrate(100);
		}
	}
}

function copyBase64(id) {
	// Get the text field
	var copyText = document.getElementById("imgBase64"+id);  
	// Select the text field
	copyText.select();
	//copyText.setSelectionRange(0, 99999); // For mobile devices  
	 // Copy the text inside the text field
	navigator.clipboard.writeText(copyText.value);  
	// Alert the copied text
	alert(copyText.value);
  }
