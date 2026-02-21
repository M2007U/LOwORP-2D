//---- ---- ---- ---- html functions

//getElementbyID but shorter
function POwO_docgetel(InString)
{
    return document.getElementById(InString);
}

//---- ---- ---- ---- math functions

//math clamping
function POwO_Math_Clamp(InMin, InVal, InMax)
{
    
    //return Math.max(InMin, Math.min(InVal, InMax) );
    if (InVal > InMax)
    {
        return InMax;
    }
    else if (InVal < InMin)
    {
        return InMin;
    }
    else
    {
        return InVal;
    }

}

//math lerping
function POwO_Math_LERP(A, B, t)
{
    return (B-A) * t + A
}

function POwO_Math_LERP_Array(A,B,t)
{
    if (A.length === B.length)
    {
        let V = []
        for(let i = 0 ; i < A.length ; i++)
        {
            V.push(POwO_Math_LERP(A[i],B[i],t))
        }
        return V
    }
    else
    {
        return []
    }
}

//math lerping rev
function POwO_Math_LERPinv(A,B,V)
{
    let ReturnResult = 0;

    if (A==B)
    {
        ReturnResult = A;
    }
    else
    {
        ReturnResult = (V-A) / (B-A) 
    }
    
    return ReturnResult;
}

//math lerp Mapping
function POwO_Math_LERPmap(a,b,v,A,B)
{
    let t = POwO_Math_LERPinv(a,b,v);
    return POwO_Math_LERP(A,B,t);
}

// ---- ---- ---- ---- page function

function POwO_getMouse(event)
{
    const rect = canvas.getBoundingClientRect();

    return {
        temp_mouseX: event.clientX - rect.left,
        temp_mouseY: event.clientY - rect.top
    };
}

function POwO_QuickCalculate(inCurrentTValue)
{
    /*
    will return :
    [
        [FinalPosX, Final.PosY],
        lineCoordinates = [[X1,Y1,X2,Y2] , [X1,Y1,X2,Y2] , ... , [X1,Y1,X2,Y2]]  ,
        PointCoordinates = [[X,Y] , [X,Y] , ... , [X,Y]]
    ]
    */

    let out_final_pos = [null,null]
    let out_drawcall_lines = []
    let out_drawcall_points = []

    let temp_TODO_A = []
    let temp_TODO_B = []

    for(let i = 0 ; i < GLOBAL_shapeList.length ; i++) //adding all control points to the todo list
    {
        temp_TODO_A.push( [GLOBAL_shapeList[i].PosX , GLOBAL_shapeList[i].PosY] )
    }

    let EmergencyBrake = 1024
    while(temp_TODO_A.length > 1 && EmergencyBrake > 0) //Lerp until run out of anything to lerp
    {
        EmergencyBrake--

        //create lerp lines, and create lerp points
        for(let i = 0 ; i < temp_TODO_A.length - 1 ; i++)
        {
            let temp_A = temp_TODO_A[i]
            let temp_B = temp_TODO_A[i+1]

            out_drawcall_lines.push( [ temp_A[0] , temp_A[1] , temp_B[0] , temp_B[1] ] )
            let temp_V = [ POwO_Math_LERP(temp_A[0], temp_B[0], inCurrentTValue),POwO_Math_LERP(temp_A[1], temp_B[1], inCurrentTValue) ]
            temp_TODO_B.push(temp_V)
            out_drawcall_points.push(temp_V)
        }

        //move from todoA to todoB, getting ready for the next iter
        temp_TODO_A = []
        for(let i = 0 ; i < temp_TODO_B.length ; i++)
        {
            temp_TODO_A.push( temp_TODO_B[i] )
        }
        temp_TODO_B = []

    }

    //at this point, temp_TODO_A only has one point left, which is the final LERPING point
    out_final_pos = [ temp_TODO_A[0][0] , temp_TODO_A[0][1] ]

    return [ out_final_pos , out_drawcall_lines , out_drawcall_points ]
}

function POwO_RedrawAll(inDrawData)
{
    let temp_StartColor = [255,0,0,1]
    let temp_EndColor = [0,255,255,1]

    //clear frame
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    //draw bezier curve
    let temp_trailPositions = []
    for(let i = 0 ; i <= 1 ; i += GLOBAL_TvalueDelta)
    {
        let temp_Catch = POwO_QuickCalculate(i)
        temp_trailPositions.push( temp_Catch[0] )
    }
    ctx.lineWidth = 5    
    for(let i = 0 ; i < temp_trailPositions.length-1; i ++) //draw all the lines
    {
        ctx.beginPath()
        ctx.moveTo( temp_trailPositions[i][0] , temp_trailPositions[i][1] )
        let temp_CurrentColor = POwO_Math_LERP_Array(temp_StartColor,temp_EndColor,i/(temp_trailPositions.length-1))
        ctx.strokeStyle = "rgba(" + temp_CurrentColor[0] + "," + temp_CurrentColor[1] + "," + temp_CurrentColor[2] + "," + temp_CurrentColor[3] + ")"
        ctx.lineTo( temp_trailPositions[i+1][0] , temp_trailPositions[i+1][1] )
        ctx.stroke()
    }
    

    //prepare to draw contorl points, lerping points, lerping lines, and final point
    let in_finalPos = inDrawData[0]
    let in_drawcall_lines = inDrawData[1]
    let in_drawcall_points = inDrawData[2]

    //draw all the lines
    ctx.strokeStyle = "rgba(255,192,0,0.5)"
    ctx.lineWidth = 2
    for(let i = 0 ; i < in_drawcall_lines.length ; i ++) 
    {
        ctx.beginPath()
        ctx.moveTo( in_drawcall_lines[i][0] , in_drawcall_lines[i][1] )
        ctx.lineTo( in_drawcall_lines[i][2] , in_drawcall_lines[i][3] )
        ctx.stroke()
    }

    //draw all the lerping points
    ctx.fillStyle = "rgba(255,192,0,0.5)";
    ctx.strokeStyle = "rgba(0,0,0,0)";
    ctx.lineWidth = 0;
    for(let i = 0 ; i < in_drawcall_points.length ; i++) 
    {
        let temp_currentRadius = GLOBAL_visual_lerpingPoint_radius
        if (i === in_drawcall_points.length - 1)
        {
            //write text first
            let temp_CurrentColor = POwO_Math_LERP_Array(temp_StartColor,temp_EndColor,GLOBAL_Tvalue)
            let temp_CurrentColorString = "rgba(" + temp_CurrentColor[0] + "," + temp_CurrentColor[1] + "," + temp_CurrentColor[2] + "," + temp_CurrentColor[3] + ")"
            ctx.strokeStyle = temp_CurrentColorString
            ctx.fillStyle = temp_CurrentColorString
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("t = " + GLOBAL_Tvalue, in_drawcall_points[i][0], in_drawcall_points[i][1]-40);
            
            //then draw the point
            ctx.fillStyle = temp_CurrentColorString
            temp_currentRadius = GLOBAL_visual_finalPoint_radius
        }

        ctx.beginPath()
        ctx.arc(in_drawcall_points[i][0], in_drawcall_points[i][1], temp_currentRadius, 0, Math.PI * 2)
        ctx.fill();
        ctx.stroke();
    }


    for(let i = 0 ; i < GLOBAL_shapeList.length ; i++) //draw all control points
    {
        let temp_CurrentColor = POwO_Math_LERP_Array(temp_StartColor,temp_EndColor,i/(GLOBAL_shapeList.length-1))
        let temp_CurrentColorString = "rgba(" + temp_CurrentColor[0] + "," + temp_CurrentColor[1] + "," + temp_CurrentColor[2] + "," + temp_CurrentColor[3] + ")"

        //draw circle
        GLOBAL_shapeList[i].ColorFill = temp_CurrentColorString
        GLOBAL_shapeList[i].drawMe(ctx)

        //draw ring
        ctx.beginPath()
        ctx.lineWidth = GLOBAL_visual_controlPoint_linewidth
        ctx.strokeStyle = temp_CurrentColorString
        ctx.arc(GLOBAL_shapeList[i].PosX, GLOBAL_shapeList[i].PosY, GLOBAL_visual_controlPoint_radius_ring, 0, Math.PI * 2);
        ctx.stroke()


        ctx.fillStyle = temp_CurrentColorString;         // text color
        ctx.font = "24px Arial";         // font size and family
        ctx.textAlign = "center";   // "start" | "end" | "left" | "right" | "center"
        ctx.textBaseline = "middle"; // "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom"
        ctx.fillText("P" + i.toString(), GLOBAL_shapeList[i].PosX, GLOBAL_shapeList[i].PosY+50);  // x, y = position (baseline by default)
        
    }
}



// ---- ---- ---- ---- SETUP

const canvas = document.getElementById("kanvas");
const ctx = canvas.getContext("2d");
const HTML_Body = POwO_docgetel("HTML_body")

class ShOwOpe
{
    constructor
    (
        inPosX, inPosY, inPosZ,
        inType, inParam0, inParam1, inColorStroke, inStrokeWidth, inColorFill,
        inDragable, inNotes
    )
    {
        this.PosX = inPosX
        this.PosY = inPosY
        this.PosZ = inPosZ
        this.Type = inType
        this.Param0 = inParam0
        this.Param1 = inParam1
        this.ColorStroke = inColorStroke
        this.StrokeWidth = inStrokeWidth
        this.ColorFill = inColorFill
        this.IsDragable = inDragable
        this.Notes = inNotes
    }

    drawMe(inKanvasContext)
    {
        inKanvasContext.beginPath()

        switch (this.Type)
        {

            case "circle":
                inKanvasContext.arc(this.PosX, this.PosY, this.Param0, 0, Math.PI * 2);
            break;

            case "rect" :
                let temp_RadiusX = this.Param0 / 2
                let temp_RadiusY = this.Param1 / 2
                inKanvasContext.rect(this.PosX - temp_RadiusX , this.PosY - temp_RadiusY , this.Param0, this.Param1);
            break;
        
            default:
            break;
        }

        inKanvasContext.fillStyle = this.ColorFill;
        inKanvasContext.strokeStyle = this.ColorStroke;
        inKanvasContext.lineWidth = this.StrokeWidth;

        inKanvasContext.fill();
        inKanvasContext.stroke();
    }

    isInside(mouseX, mouseY)
    {
        if (this.IsDragable)
        {
            switch(this.Type)
            {
                case "circle":
                    let dx = mouseX - this.PosX;
                    let dy = mouseY - this.PosY;
                    return (dx*dx + dy*dy) <= (this.Param0*this.Param0);
                break;

                case "rect":
                    let temp_RadiusX = this.Param0 / 2
                    let temp_RadiusY = this.Param1 / 2

                    return (
                        mouseX >= this.PosX - temp_RadiusX &&
                        mouseX <= this.PosX + temp_RadiusX &&
                        mouseY >= this.PosY - temp_RadiusY &&
                        mouseY <= this.PosY + temp_RadiusY
                    );
                break;

                default: return false; break;
            }
        }
        else
        {
            return false;
        }

        return false;
    }
}

canvas.addEventListener("mousedown", (event) => {

    const { temp_mouseX, temp_mouseY } = POwO_getMouse(event);

    for (let i = GLOBAL_shapeList.length - 1; i >= 0 ; i--)
    {
        if (GLOBAL_shapeList[i].isInside(temp_mouseX, temp_mouseY))
        {
            GLOBAL_selectedShape = GLOBAL_shapeList[i];
            console.log("selectedShape : " + JSON.stringify(GLOBAL_selectedShape))

            GLOBAL_dragOffsetX = temp_mouseX - GLOBAL_selectedShape.PosX;
            GLOBAL_dragOffsetY = temp_mouseY - GLOBAL_selectedShape.PosY;

            break;
        }
    }


});

canvas.addEventListener("mousemove", (event) => {

    if (!GLOBAL_selectedShape) return;

    const { temp_mouseX, temp_mouseY } = POwO_getMouse(event);

    GLOBAL_selectedShape.PosX = POwO_Math_Clamp(0,temp_mouseX - GLOBAL_dragOffsetX, canvas.width) ;
    GLOBAL_selectedShape.PosY = POwO_Math_Clamp(0,temp_mouseY - GLOBAL_dragOffsetY,canvas.height);

    let temp_DrawData = POwO_QuickCalculate(GLOBAL_Tvalue)
    POwO_RedrawAll(temp_DrawData);
});

canvas.addEventListener("mouseup", () => {
    GLOBAL_selectedShape = null;
    console.log("selectedShape : " + JSON.stringify(GLOBAL_selectedShape))
});

HTML_Body.addEventListener("mouseup", () => {
    GLOBAL_selectedShape = null;
    console.log("selectedShape : " + JSON.stringify(GLOBAL_selectedShape))
});

document.addEventListener("keydown",(event)=>{
    if (event.key === "1")
    {
        GLOBAL_Tvalue = POwO_Math_Clamp(0,GLOBAL_Tvalue - GLOBAL_TvalueDelta,1)
        console.log("Tvalue : " + GLOBAL_Tvalue)
    }
    else if (event.key === "2")
    {
        GLOBAL_Tvalue = POwO_Math_Clamp(0,GLOBAL_Tvalue + GLOBAL_TvalueDelta,1)
        console.log("Tvalue : " + GLOBAL_Tvalue)
    }
    else if (event.key === "3")
    {
        GLOBAL_shapeList.pop()
    }
    else if (event.key === "4")
    {
        let temp_R = POwO_Math_LERP(0,300,Math.random())
        let temp_A = POwO_Math_LERP(0,2 * Math.PI,Math.random())
        let temp_CX = canvas.width/2
        let temp_CY = canvas.height/2
        GLOBAL_shapeList.push( new ShOwOpe(  temp_CX + Math.cos(temp_A) * temp_R , temp_CY + Math.sin(temp_A) * temp_R , 1, "circle", GLOBAL_visual_controlPoint_radius_solid, -1, "rgba(0,0,0,0)", 0, "rgba(255,0,0,1)",true,"P" + GLOBAL_shapeList.length) )
    }
    else if (event.key === "5" || event.key === "6")
    {
        let temp_factor = 1
        if (event.key === "5"){temp_factor = 0.75}
        else if (event.key === "6"){temp_factor = 1.25}
        
        for(let i = 0 ; i < GLOBAL_shapeList.length ; i++)
        {
            let oldPosX = GLOBAL_shapeList[i].PosX
            let oldPosY = GLOBAL_shapeList[i].PosY
            let oldDisX = oldPosX - canvas.width / 2
            let oldDisY = oldPosY - canvas.height / 2
            let newDisX = oldDisX * temp_factor
            let newDisY = oldDisY * temp_factor
            GLOBAL_shapeList[i].PosX = POwO_Math_Clamp(0,canvas.width / 2 + newDisX,canvas.width)
            GLOBAL_shapeList[i].PosY = POwO_Math_Clamp(0,canvas.height / 2 + newDisY,canvas.height)

        }
    }

    
    let temp_DrawData = POwO_QuickCalculate(GLOBAL_Tvalue)
    POwO_RedrawAll(temp_DrawData);
})

window.addEventListener("message",(event)=>
{
    GLOBAL_Tvalue = POwO_Math_Clamp(0,event.data,1)
    let temp_DrawData = POwO_QuickCalculate(GLOBAL_Tvalue)
    POwO_RedrawAll(temp_DrawData);
})

var GLOBAL_shapeList = [];
var GLOBAL_selectedShape = null;
var GLOBAL_dragOffsetX = 0;
var GLOBAL_dragOffsetY = 0;
var GLOBAL_Tvalue = 0
var GLOBAL_TvalueDelta = 1/128

var GLOBAL_visual_controlPoint_radius_solid = 20
var GLOBAL_visual_controlPoint_radius_ring = 30
var GLOBAL_visual_controlPoint_linewidth = 5
var GLOBAL_visual_lerpingPoint_radius = 8
var GLOBAL_visual_finalPoint_radius = 16




// ---- ---- ---- ---- RUN MAIN

//980/2 = 490
let smol_radius = 350
let smol_P0 = new ShOwOpe(canvas.width / 2 - smol_radius , canvas.height / 2 , 1, "circle", GLOBAL_visual_controlPoint_radius_solid, -1, "rgba(0,0,0,0)", 0, "rgba(255,0,0,1)",true,"P0")
let smol_P1 = new ShOwOpe(canvas.width / 2 , canvas.height / 2 - smol_radius , 1, "circle", GLOBAL_visual_controlPoint_radius_solid, -1, "rgba(0,0,0,0)", 0, "rgba(255,255,255,1)",true,"P1")
let smol_P2 = new ShOwOpe(canvas.width / 2 , canvas.height / 2 + smol_radius , 1, "circle", GLOBAL_visual_controlPoint_radius_solid, -1, "rgba(0,0,0,0)", 0, "rgba(255,255,255,1)",true,"P2")
let smol_P3 = new ShOwOpe(canvas.width / 2 + smol_radius , canvas.height / 2 , 1, "circle", GLOBAL_visual_controlPoint_radius_solid, -1, "rgba(0,0,0,0)", 0, "rgba(0,255,255,1)",true,"P3")


GLOBAL_shapeList.push(smol_P0)
GLOBAL_shapeList.push(smol_P1)
GLOBAL_shapeList.push(smol_P2)
GLOBAL_shapeList.push(smol_P3)

let temp_DrawData = POwO_QuickCalculate(GLOBAL_Tvalue)
POwO_RedrawAll(temp_DrawData);

