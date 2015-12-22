function Scroll(container){
	try{
		this.init=function(){
			try{
				var elements=this.root.getElementsByTagName('*');
				var reg=new RegExp('\\b'+this.searchCalss+'\\b');
				this.scrolls=[];
				for(i=0;i!=elements.length;i++){
					if((elements[i].hasAttribute('class')) && elements[i].getAttribute('class').match(reg)){
						var orientationReg=/^(vert|horiz).*/;
						if(elements[i].hasAttribute('scroll-orientation') && (matches=elements[i].getAttribute('scroll-orientation').match(orientationReg)))
							var orientation=matches[1];
						else orientation='horiz';
						if(elements[i].hasAttribute('id'))var id=elements[i].getAttribute('id');
						else var id='';
						var prop={
							'controls':this.createScrollControls(elements[i]),
							'scroll':elements[i],
							'orientation':orientation,
							'callback':function(){},
							'id':id,
							'start':0,
							'procLimiterDst':0,
							'lastProcLimiterDst':0,
							'procControlDst':0,
							'lastProcControlDst':0
						};
						this.scrolls.push(prop);
						elements[i].onmousedown=function(obj,prop){
							return function(event){
								var event= event ? event : window.event;
								if(event.target==prop.scroll){
									prop.start=obj.getCursorPoint(event,prop);
									obj.setPosition(prop);
								}
								else if(event.target==prop.controls.control || event.target==prop.controls.limiter){
									prop.start=obj.getCursorPoint(event,prop);
									document.body.onmousemove=function(event){obj.moveFunction(event,prop);}
									document.body.onmouseup=function(){
										document.body.onmousemove=function(){};
										prop.lastProcLimiterDst=prop.procLimiterDst;
										prop.lastProcControlDst=prop.procControlDst;
									};
								}
							}
						}(this,prop);
					}
				}
			}
			catch(e){console.log(e);}
		}
		this.getPosition=function(prop){return prop.lastProcControlDst;}
		this.getScrollById=function(id){
			try{
				for(i=0;i!=this.scrolls.length;i++){
					if(this.scrolls[i].id==id)return this.scrolls[i];
				}
				return false;
			}
			catch(e){console.log(e);}
		}
		this.setSizeLimiter=function(prop,proc){
			var data=this.getVar(prop);
			prop.controls.limiter.style[data.so]=proc+'%';
			this.setPositionProc(prop,prop.lastProcControlDst);
		}
		this.setSize=function(prop,forScroll,forLimiter){
			this.setSizeLimiter(prop,forLimiter/(forScroll/100));
		}
		this.getCursorPoint=function(event,prop){
			switch(prop.orientation){
				case 'horiz':
					return event.clientX;
				break;
				case 'vert':
					return event.clientY;
				break;
			}
		}
		this.getSizeOption=function(prop){
			switch(prop.orientation){
				case 'horiz':
					return 'width';
				break;
				case 'vert':
					return 'height';
				break;
			}
		}
		this.getPositionOption=function(prop){
			switch(prop.orientation){
				case 'horiz':
					return 'left';
				break;
				case 'vert':
					return 'top';
				break;
			}
		}
		this.getVar=function(prop){
			try{
				var bcr=prop.scroll.getBoundingClientRect();
				var bcrLim=prop.controls.limiter.getBoundingClientRect();

				var so=this.getSizeOption(prop);
				var po=this.getPositionOption(prop);

				var widthProc=bcr[so]/100;
				var widthNotLimitProc=(bcr[so]-bcrLim[so])/100;

				return {
					'bcr':bcr,
					'bcrLim':bcrLim,
					'so':so,
					'po':po,
					'widthProc':widthProc,
					'widthNotLimitProc':widthNotLimitProc
				};
			}
			catch(e){console.log(e);}
		}
		this.refreshLimiterPosition=function(prop,data,noSave){
			try{
				prop.controls.limiter.style[data.po]=prop.procLimiterDst+'%';
				prop.controls.control.style[data.po]=prop.procControlDst+'%';
				if(!noSave){
					prop.lastProcLimiterDst=prop.procLimiterDst;
					prop.lastProcControlDst=prop.procControlDst;
				}
				prop.callback(prop,prop.procControlDst);
			}
			catch(e){console.log(e);}
		}
		this.correctLimiterPosition=function(prop,data){
			try{
				if(prop.procControlDst>100){
					prop.procControlDst=100;
					prop.procLimiterDst=100-(data.bcrLim[data.so]/data.widthProc);
				}
				else if(prop.procControlDst<0){
					prop.procControlDst=0;
					prop.procLimiterDst=0;
				}
			}
			catch(e){console.log(e);}
		}
		this.setPositionProc=function(prop,proc){
			var data=this.getVar(prop);

			prop.procLimiterDst=(proc*data.widthNotLimitProc)/data.widthProc;
			prop.procControlDst=proc;

			this.correctLimiterPosition(prop,data);
			this.refreshLimiterPosition(prop,data);
		}
		this.setPosition=function(prop){
			var data=this.getVar(prop);

			var setProc=(prop.start-data.bcr[data.po])/data.widthProc;
			var setProcControl=(prop.start-data.bcr[data.po])/data.widthNotLimitProc;

			prop.procLimiterDst=setProc-(data.bcrLim[data.so]/data.widthProc)/2;
			prop.procControlDst=setProcControl-(data.bcrLim[data.so]/data.widthNotLimitProc)/2;

			this.correctLimiterPosition(prop,data);
			this.refreshLimiterPosition(prop,data);
		}
		this.moveFunction=function(event,prop){
			var event= event ? event : window.event;
			var data=this.getVar(prop);
			var cp=this.getCursorPoint(event,prop);

			prop.procLimiterDst=prop.lastProcLimiterDst+(cp-prop.start)/data.widthProc;
			prop.procControlDst=prop.lastProcControlDst+(cp-prop.start)/data.widthNotLimitProc;

			this.correctLimiterPosition(prop,data);
			this.refreshLimiterPosition(prop,data,1);
		}
		this.createScrollControls=function(scrollContainer){
			try{
				var ret={};
				if(scrollContainer){
					var control=document.createElement('div');
					control.setAttribute('class','control');
					control.style.position='relative';
					var limiter=document.createElement('div');
					limiter.style.position='absolute';
					limiter.style.display='inline-block';
					limiter.setAttribute('class','limiter');
					limiter.appendChild(control);
					scrollContainer.appendChild(limiter);
					ret.control=control;
					ret.limiter=limiter;
				}
				return ret;
			}
			catch(e){console.log(e);}
		}
		this.scrolls=[];
		this.searchCalss='Scroll';
		if(container)this.root=container;
		else this.root=document.body;
		this.init();
		// scroll-orientation (vert|horiz) атрибут указывает по какой оси работает скролл
	}
	catch(e){console.log(e);}
}