/**************************************************************************************************
 * Copyright (C) 2019 Chad Pyle - All Rights Reserved
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *************************************************************************************************/

 /*Class - Project initialization and setup */
class DPM
{
    constructor()
    {
        console.log('initalizing project')
        this.input_m1 = $('#mass_1');
        this.input_m2 = $('#mass_2');
        this.input_l1 = $('#length_1');
        this.input_l2 = $('#length_2');
        this.input_g = $('#gravity');
        
        this.rad =( Math.PI / 180);
        this.initialize();
    }

    // Sets inital conditions of the pendulum on page load and reset
    initialize()
    {
        // Object 1 conditions
        this.m1 = parseFloat(this.input_m1.val());                      // mass of object 1
        this.l1 = parseFloat(this.input_l1.val());                      // length of arm 1
        this.a1 = 45;                                                   // angle of arm 1 with vertical
        this.w1 = 0;                                                    // angular velocity of object 1
        this.x1 = this.l1 * Math.sin(this.a1*this.rad);                 // x-coord of object 1
        this.y1 = this.l1 * Math.cos(this.a1*this.rad);                 // y-coord of object 1

        // Object 2 conditions
        this.m2 = parseFloat(this.input_m2.val());                      // mass of object 2
        this.l2 = parseFloat(this.input_l2.val());                      // length of arm 2
        this.a2 = 45;                                                   // angle of arm 2 with vertical
        this.w2 = 0;                                                    // angular velocity of object 2
        this.x2 = this.x1 + this.l2 * Math.sin(this.a2*this.rad);       // x-coord of object 2
        this.y2 = this.l1 + this.l2 * Math.cos(this.a2*this.rad);       // y-coord of object 2

        // Global conditions
        this.g = this.input_g.val();                                  // gravity
        this.t = 0.0                                                    // time
        this.t_s = 0.05                                                 // time step
    }
}

/*Class - Global UI definitions */
class AppUI extends DPM
{
    constructor()
    {
        super()
        console.log('loading AppUI')

        this.start = $('#dpm_start');
        this.stop = $('#dpm_stop');
        this.reset = $('#dpm_reset');

        this.setup();
    }

    // Sets up UI interation events
    setup()
    {
        var that = this;

        // Establish inital canvas state
        this.establishCanvas();

        // Start button click event
        this.start.on('click',function(){
            $(this).removeClass('show');
            that.stop.addClass('show');
            that.startModel();
        });

        // Stop button click event
        this.stop.on('click',function(){
            $(this).removeClass('show');
            that.start.addClass('show');
            that.stopModel();
        });


        // Resets entire project to inital state
        this.reset.on('click',function(){
            that.start.addClass('show');
            that.stop.removeClass('show');
            that.resetModel();
        });

        // On-change event for mass 1 input
        this.input_m1.on('change',function(){
            that.m1 = $(this).val();
            that.renderObjects();
        });

        // On-change event for mass 2 input
        this.input_m2.on('change',function(){
            that.m2 = $(this).val();
            that.renderObjects();
        });

        // On-change event for length 1 input
        this.input_l1.on('change',function(){
            that.l1 = $(this).val();
            that.renderObjects();
        });

        // On-change event for length 2 input
        this.input_l2.on('change',function(){
            that.l2 = $(this).val();
            that.renderObjects();
        });

        // On-change event for gravity input
        this.input_g.on('change',function(){
            that.g = $(this).val();
            that.renderObjects();
        });
    }

    // Establishes base canvas objects and actions - using FabricJS
    establishCanvas()
    {
        var that = this;

        // Establish HTML5 canvas object
        this.canvas = new fabric.Canvas('dpm_canvas',{
            selectable: true,
            height: 400,
            width: 500
        });
        this.canvas.setZoom(10)
        this.canvas.viewportTransform[4] = 250;
        this.canvas.viewportTransform[5] = 50;

        // Draws dot on origin
        this.origin = new fabric.Circle({
            left: 0,
            top: 0,
            radius: 10 / that.canvas.getZoom(),
            fill: '#000',
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false
        });

        // Draws object 1 dot
        this.obj1 = new fabric.Circle({
            type: 'obj1',
            left: that.x1,
            top: that.y1,
            radius: 8 / that.canvas.getZoom(),
            strokeWidth: 2 / that.canvas.getZoom(),
            stroke: '#000',
            fill: 'red',
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: false,
            hasBorders: false,
        });

        // Draws line connecting origin to object 1
        this.line1 = new fabric.Line([0,0,that.x1,that.y1],{
            type: 'line1',
            strokeWidth: 2 / that.canvas.getZoom(),
            stroke: '#000',
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            objectCaching: false
        });

        // Draws object 2 dot
        this.obj2 = new fabric.Circle({
            type: 'obj2',
            left: that.x2,
            top: that.y2,
            radius: 8 / that.canvas.getZoom(),
            strokeWidth: 2 / that.canvas.getZoom(),
            stroke: '#000',
            fill: 'red',
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: false,
            hasBorders: false,
        });

        // Draws line connecting object 1 to object 2
        this.line2 = new fabric.Line([that.x1,that.y1,that.x2,that.y2],{
            strokeWidth: 2 / that.canvas.getZoom(),
            type: 'line2',
            stroke: '#000',
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            objectCaching: false
        });

        // Adds and orders all objects to canvas
        this.canvas.add(this.origin);
        this.canvas.add(this.obj1);
        this.obj1.setCoords();
        this.canvas.add(this.line1);
        this.canvas.sendToBack(this.line1);
        this.canvas.add(this.obj2);
        this.canvas.add(this.line2);
        this.canvas.sendToBack(this.line2);
        
        this.canvas.renderAll();

        // Object moving events to track and rerender canvas objects
        this.canvas.on('object:moving',function(e){
            var p = e.target;
            if(p.type === 'obj1'){
                var ctr_x = 0;
                var ctr_y = 0 + that.l1;
                var rad = Math.atan2(p.top + ctr_y, p.left + ctr_x)
                that.a1 = 90 - (rad / that.rad)
            }else if(p.type === 'obj2'){
                var ctr_x = that.x1;
                var ctr_y = that.y1 + that.l2;
                var rad = Math.atan2(p.top + ctr_y, p.left + ctr_x)
                that.a2 = 90 - (rad / that.rad)
            }
            
            that.renderObjects();
        });

        // Resets object coordinates after moved object
        this.canvas.on('mouse:up',function(){
            that.canvas.forEachObject(function(o) {
                o.setCoords();
            });
        })
    }

    // Static rendering for canvas objects
    renderObjects()
    {
        var that = this;
        this.x1 = this.l1 * Math.sin(this.a1*this.rad);
        this.y1 = this.l1 * Math.cos(this.a1*this.rad);
        this.x2 = this.x1 + this.l2 * Math.sin(this.a2*this.rad);
        this.y2 = this.y1 + this.l2 * Math.cos(this.a2*this.rad);

        this.obj1.left = this.x1;
        this.obj1.top = this.y1;
        this.obj2.left = this.x2;
        this.obj2.top = this.y2;

        this.line1.set({ x2:that.x1, y2:that.y1 });
        this.line2.set({ x1:that.x1, y1:that.y1, x2:that.x2, y2:that.y2 });

        this.canvas.renderAll();
    }
}

/* Class - Modeling and rendering */
class Modeler extends AppUI
{
    constructor()
    {
        super()
        console.log('loading Modeler')

        this.clock = $('#dpm_stopwatch');
    }
 
    // Initalizes active modeling - called on-click [start]
    startModel()
    {
        var that = this;

        this.t_mil = 0.0;
        this.t_sec = 0.0;
        this.t_min = 0.0;
        this.isModeling = true;

        // Main rendering loop - 50 millisecond loop
        this.model = setInterval(function(){ 
            that.rk4_approx();
            that.stopWatch()
        },50);
    }

    // Halts active modeling - called on-click [stop]
    stopModel()
    {
        this.isModeling = false;
        clearInterval(this.model);
    }

    // Resets entire model - called on-click [reset]
    resetModel()
    {
        this.stopModel();
        this.input_m1.val('1.00');
        this.input_m2.val('1.00');
        this.input_l1.val('10.00');
        this.input_l2.val('10.00');
        this.input_g.val('9.81');
        this.clock.html('00:00:00');
        this.initialize();
        this.renderObjects();
    }

    // Active modeling rendering - called from main rendering loop
    activeRender()
    {
        var that = this;
        if(!this.isModeling){ return }

        this.x1 = this.l1 * Math.sin(this.a1*this.rad);
        this.y1 = this.l1 * Math.cos(this.a1*this.rad);
        this.x2 = this.x1 + this.l2 * Math.sin(this.a2*this.rad);
        this.y2 = this.y1 + this.l2 * Math.cos(this.a2*this.rad);

        this.obj1.left = this.x1;
        this.obj1.top = this.y1;
        this.obj2.left = this.x2;
        this.obj2.top = this.y2;

        this.line1.set({ x2:that.x1, y2:that.y1 });
        this.line2.set({ x1:that.x1, y1:that.y1, x2:that.x2, y2:that.y2 });

        this.canvas.renderAll();
    }

    // Tracks modeling time per loop
    stopWatch()
    {
        this.time += this.t_s;

        this.t_mil += 5;
        if(this.t_mil > 95){
            this.t_mil = 0;
            this.t_sec ++;
            if(this.t_sec >= 60){
                this.t_sec = 0;
                this.t_min ++;
            }
        }

        this.clock.html((this.t_min ? (this.t_min > 9 ? this.t_min : '0'+t_min) : '00') + ':' + (this.t_sec ? (this.t_sec > 9 ? this.t_sec : '0'+this.t_sec) : '00') + ':' + (this.t_mil ? (this.t_mil > 5 ? this.t_mil : '0'+this.t_mil) : '00'));
    }
}

/* Class - Main calculations [full documentation found in README.md] */
class CalcEngine extends Modeler
{
    constructor()
    {
        super()
        console.log('loading CalcEngine')
    }

    // 1 of 4 - 1st order equation of numerical solution set
    a1_dot(w1,w2)
    {
        return (w1/this.rad)*this.t_s;
    }

    // 2 of 4 - 1st order equation of numerical solution set
    a2_dot(w1,w2)
    {
        return (w2/this.rad)*this.t_s;
    }

    // 3 of 4 - 1st order equation of numerical solution set
    w1_dot(w1,w2)
    {
        var a12 = (this.a1 - this.a2);
        var top1 = -this.g*(2*this.m1+this.m2)*Math.sin(this.a1*this.rad) - this.g*this.m2*Math.sin(a12*this.rad);
        var top2 = -2*Math.sin(a12*this.rad)*this.m2*((w2**2)*this.l2+(w1**2)*this.l1*Math.cos(a12*this.rad));
        var bot = this.l1*(2*this.m1+this.m2-this.m2*Math.cos(2*a12*this.rad));

        return (top1+top2)/bot
        //var num = this.f1(w2) - (this.alpha1() * this.f2(w1));
        //var den = 1 - (this.alpha1() * this.alpha2());
        //return (num/den);
    }

    // 4 of 4 - 1st order equation of numerical solution set
    w2_dot(w1,w2)
    {
        var m12 = (this.m1 + this.m2);
        var a12 = (this.a1 - this.a2);
        var top = 2*Math.sin(a12*this.rad)*((w1**2)*this.l1*(m12) + this.g*(m12)*Math.cos(this.a1*this.rad) + (w2**2)*this.l2*this.m2*Math.cos(a12*this.rad))
        var bot = this.l1*(2*this.m1+this.m2-this.m2*Math.cos(2*a12*this.rad));
        
        console.log((top)/bot)
        return (top)/bot
        //var num = this.f2(w1) - (this.alpha2() * this.f1(w2));
        //var den = 1 - (this.alpha1() * this.alpha2());
        //return (num/den);
    }
    
    // Support function for w1_dot and w2_dot (above)
    f1(w2)
    {
        var val = - (((this.l2 / this.l1) * (this.m2 / (this.m1 + this.m2))) * w2**2 * Math.sin((this.a1 - this.a2)*this.rad)) - ((this.g / this.l1) * Math.sin(this.a1*this.rad));
        return val;
    }

    // Support function for w1_dot and w2_dot (above
    f2(w1)
    {
        var val = ((this.l1 / this.l2) * w1**2 * Math.sin((this.a1 - this.a2)*this.rad)) - (this.g / this.l2) * Math.sin(this.a2*this.rad);
        return val;
    }

    // Support function for w1_dot and w2_dot (above
    alpha1()
    {
        var val = (this.l2 / this.l1) * (this.m2 / (this.m1 + this.m2)) * Math.cos((this.a1 - this.a2)*this.rad);
        return val;
    }

    // Support function for w1_dot and w2_dot (above
    alpha2()
    {
        var val = (this.l1 / this.l2) * Math.cos((this.a1 + this.a2)*this.rad);
        return val;
    }
}

/* Class - Runge-Kutta 4th order algorithm [full documentation found in README.md] */
class RK4 extends CalcEngine
{
    constructor()
    {
        super()
        console.log('loading RK4')
    }

    // Sets main approximation loops for all 4 solution sets
    rk4_approx()
    {
        var that = this;
        
        var dot_w1 = this.method(this.w1,this.w2,0,0,this.w1_dot.bind(this));
        var dot_w2 = this.method(this.w1,this.w2,0,0,this.w2_dot.bind(this));
        var dot_a1 = this.method(dot_w1,0,step(dot_w1),0,this.a1_dot.bind(this));
        var dot_a2 = this.method(0,dot_w2,0,step(dot_w2),this.a2_dot.bind(this));

        this.a1 += dot_a1;
        this.a2 += dot_a2;
        this.w1 = dot_w1;
        this.w2 = dot_w2;

        this.activeRender();

        function step(val){
            return val * that.t_s;
        }
    }

    // Actual numerical calculations of RK4 algorithm
    method(val1,val2,step1,step2,fxn){        
        var a = this.a(val1+step1,val2+step2,fxn);
        var b = this.b(val1+step1,val2+step2,fxn);
        var c = this.c(val1+step1,val2+step2,fxn);
        var d = this.d(val1+step1,val2+step2,fxn);
        
        return fxn(val1,val2) + (this.t_s/6) * (a + 2*b + 2*c + d)
    }

    // Support function for method (above)
    a(val1,val2,fxn){
        return fxn(val1,val2);
    }

    // Support function for method (above)
    b(val,val2,fxn){
        return fxn(val,val2) + ((this.t_s/2) * this.a(val,val2,fxn));
    }

    // Support function for method (above)
    c(val,val2,fxn){
        return fxn(val,val2) + ((this.t_s/2) * this.b(val,val2,fxn));
    }
    
    // Support function for method (above)
    d(val,val2,fxn){
        return fxn(val,val2) + (this.t_s * this.c(val,val2,fxn));
    }

}

/* Intialize project */
(() => { new RK4 } )()