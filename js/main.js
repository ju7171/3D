jQuery(document).ready(function ($) {

	var productViewer = function (element) {
		this.element = element;
		this.imageWrapper = this.element.find('.product-viewer');
		this.slideShow = this.imageWrapper.children('.product-sprite');
		this.frames = this.element.data('frame');

		this.bubble = this.element.find('.bubble');
		this.lineGroup1 = this.element.find('.line-group1');
		this.pinGroup1 = this.element.find('.pin-group1');
		this.lineGroup2 = this.element.find('.line-group2');
		this.pinGroup2 = this.element.find('.pin-group2');
		this.lineGroup3 = this.element.find('.line-group3');
		this.pinGroup3 = this.element.find('.pin-group3');
		//increase this value to increase the friction while dragging on the image - it has to be bigger than zero
		this.friction = this.element.data('friction');
		this.visibleFrame = 0;
		this.loaded = false;
		this.animating = false;
		this.xPosition = 0;
		this.loadFrames();
		this.dragImage();
		//첫화면 떴을 때 뒤에 라인들 숨기기
		this.lineGroup2.hide();
		this.pinGroup2.hide();
		this.lineGroup3.hide();
		this.pinGroup3.hide();
	}

	productViewer.prototype.loadFrames = function () {
		var self = this,
			imageUrl = this.slideShow.data('image'),
			newImg = $('<img/>');
		this.loading('0.5');

		//you need this to check if the image sprite has been loaded
		//attr - 속성(attribute)의 값을 가져오거나 속성을 추가
		newImg.attr('src', imageUrl).load(function () {
			$(this).remove();
			self.loaded = true;
		}).each(function () {
			image = this;
			if (image.complete) {
				$(image).trigger('load');
			}
		});
	}

	productViewer.prototype.loading = function (percentage) {
		var self = this;
		//transformElement(this.handleFill, 'scaleX(' + percentage + ')');
		setTimeout(function () {
			if (self.loaded) {
				self.element.addClass('loaded');
				//self.dragImage(); //화면 이미지 클릭시 바로실행 됨
			} else {
				//sprite image has not been loaded - increase self.handleFill scale value
				var newPercentage = parseFloat(percentage) + .1;
				if (newPercentage < 1) {
					self.loading(newPercentage);
				} else {
					self.loading(parseFloat(percentage));
				}
			}
		}, 500);
	}

	//이미지 클릭하면 바로실행 되는 함수
	productViewer.prototype.dragImage = function () {
		//implement image draggability
		var self = this;
		self.slideShow.on('mousedown vmousedown', function (e) {
			self.slideShow.addClass('cd-draggable');
			//offset - 선택한 요소의 좌표를 가져오거나 특정 좌표로 이동
			//outerWidth - 특정 요소의 가로 크기 가져옴
			var containerOffset = self.imageWrapper.offset().left,
				containerWidth = self.imageWrapper.outerWidth();
			// minFrame = 0,
			// maxFrame = self.frames - 1;

			self.xPosition = e.pageX;

			self.element.on('mousemove vmousemove', function (e) {
				if (!self.animating) {
					self.animating = true;
					(!window.requestAnimationFrame)
						? setTimeout(function () { self.animateDraggedImage(e, containerOffset, containerWidth); }, 100)
						: requestAnimationFrame(function () { self.animateDraggedImage(e, containerOffset, containerWidth); });
				}
			}).one('mouseup vmouseup', function (e) {
				self.slideShow.removeClass('cd-draggable');
				self.element.off('mousemove vmousemove');

			});

			e.preventDefault();

		}).on('mouseup vmouseup', function (e) {
			self.slideShow.removeClass('cd-draggable');
		});
	}
	//이미지 드래그하면 좌표움직이는 함수
	productViewer.prototype.animateDraggedImage = function (e, containerOffset, containerWidth) {
		var self = this;
		var leftValue = self.xPosition - e.pageX;
		var widthValue = Math.ceil((leftValue) * 100 / (containerWidth * self.friction));
		var frame = (widthValue * (self.frames - 1)) / 100;
		if (frame > 0) {
			frame = Math.floor(frame);
		} else {
			frame = Math.ceil(frame);
		}
		var newFrame = self.visibleFrame + frame;

		if (newFrame < 0) {
			newFrame = self.frames - 1;
		} else if (newFrame > self.frames - 1) {
			newFrame = 0;
		}

		if (newFrame != self.visibleFrame) {
			self.visibleFrame = newFrame;
			self.updateFrame();
			self.xPosition = e.pageX;
		}

		self.animating = false;
	}



	productViewer.prototype.updateFrame = function () {
		var transformValue = - (100 * this.visibleFrame / this.frames);
		//0%가 아닐때는 말풍선을 숨겼다가 0%일때 보여지게한다(초기화면에만 띄우기 위해)
		if (transformValue !== 0) {
			this.bubble.hide();
			this.lineGroup1.hide();
			this.pinGroup1.hide();
		} else {
			this.bubble.show();
			this.lineGroup1.show();
			this.pinGroup1.show();
			this.lineGroup2.hide();
			this.pinGroup2.hide();
			this.lineGroup3.hide();
			this.pinGroup3.hide();
		}
		if (transformValue !== -50) {
			this.lineGroup2.hide();
			this.pinGroup2.hide();
		} else {
			this.lineGroup2.show();
			this.pinGroup2.show();
		}
		if (transformValue !== -25) {
			this.lineGroup3.hide();
			this.pinGroup3.hide();
		} else {
			this.lineGroup3.show();
			this.pinGroup3.show();
		}
		transformElement(this.slideShow, 'translateX(' + transformValue + '%)');
	}

	function transformElement(element, value) {
		element.css({
			'-moz-transform': value,
			'-webkit-transform': value,
			'-ms-transform': value,
			'-o-transform': value,
			'transform': value,
		});
	}

	var productToursWrapper = $('.cd-product-viewer-wrapper');
	productToursWrapper.each(function () {
		new productViewer($(this));
	});
});







// <---------------모달 띄우는 함수--------------->
function modal(id) {
	var zIndex = 9999;
	var modal = document.getElementById(id);

	// 모달 div 뒤에 회색 레이어
	var bg = document.createElement('div');
	bg.setStyle({
		position: 'fixed',
		zIndex: zIndex,
		left: '0%',
		top: '0%',
		width: '100%',
		height: '100%',
		overflow: 'auto',
		backgroundColor: 'rgba(0,0,0,0.5)'
	});
	document.querySelector(".product-viewer").append(bg);

	// 닫기 버튼 처리, 회색 레이어와 모달 div 지우기
	modal.querySelector('.modal_close_btn').addEventListener('click', function () {
		bg.remove();
		modal.style.display = 'none';
	});

	modal.setStyle({
		position: 'fixed',
		display: 'block',
		boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
		// 회색 레이어 보다 한칸 위에 보이기
		zIndex: zIndex + 1,
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		msTransform: 'translate(-50%, -50%)',
		webkitTransform: 'translate(-50%, -50%)'
	});
}

// Element 에 style 한번에 오브젝트로 설정하는 함수 추가
Element.prototype.setStyle = function (styles) {
	for (var k in styles) this.style[k] = styles[k];
	return this;
};

document.getElementById('purple-bubble').addEventListener('click', function () {
	// 의왕시청 모달창 띄우기
	modal('bubble-modal1');
});
document.getElementById('yellow-bubble').addEventListener('click', function () {
	// 공동주택용지 모달창 띄우기
	modal('bubble-modal2');
});
document.getElementById('blue-bubble').addEventListener('click', function () {
	// 초등학교예정지 모달창 띄우기
	modal('bubble-modal3');
});
document.getElementById('skybridge-pin').addEventListener('click', function () {
	// 스카이브릿지 모달창 띄우기
	modal('skybridge-modal');
});
document.getElementById('terracehouse-pin').addEventListener('click', function () {
	// 테라스하우스 모달창 띄우기
	modal('terracehouse-modal');
});
document.getElementById('moonju-pin').addEventListener('click', function () {
	// 문주 모달창 띄우기
	modal('moonju-modal');
});
document.getElementById('livingfacilities-pin').addEventListener('click', function () {
	// 근린생활시설 모달창 띄우기
	modal('livingfacilities-modal');
});
document.getElementById('guesthouse-pin').addEventListener('click', function () {
	// 개스트하우스 모달창 띄우기
	modal('guesthouse-modal');
});
document.getElementById('fitness-pin').addEventListener('click', function () {
	// 피트니스 모달창 띄우기
	modal('fitness-modal');
});
document.getElementById('sunken-pin').addEventListener('click', function () {
	// 선큰 모달창 띄우기
	modal('sunken-modal');
});
document.getElementById('kindergarten-pin').addEventListener('click', function () {
	// 어린이집 모달창 띄우기
	modal('kindergarten-modal');
});
document.getElementById('playground-pin').addEventListener('click', function () {
	// 놀이터 모달창 띄우기
	modal('playground-modal');
});
