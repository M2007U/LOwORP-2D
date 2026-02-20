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

function POwO_RedrawAll()
{
    let temp_TODO_A = []
    let temp_TODO_B = []

    let temp_DRAWCALL_lines = []
    let temp_DRAWCALL_points = []

    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear frame

    for(let i = 0 ; i < GLOBAL_shapeList.length ; i++) //adding all control points to the todo list
    {
        temp_TODO_A.push( GLOBAL_shapeList[i] )
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

            temp_DRAWCALL_lines.push( [ temp_A.PosX , temp_A.PosY , temp_B.PosX , temp_B.PosY ] )
            let temp_newPoint = new ShOwOpe
            (
                POwO_Math_LERP(temp_A.PosX, temp_B.PosX, GLOBAL_Tvalue),
                POwO_Math_LERP(temp_A.PosY, temp_B.PosY, GLOBAL_Tvalue),
                -1,
                "circle",16,1,"rgba(0,0,0,0)",0,"rgba(255,0,0,0.5)",false,"lerpingPoints"
            )
            temp_TODO_B.push(temp_newPoint)
            temp_DRAWCALL_points.push(temp_newPoint)
        }

        temp_TODO_A = []
        for(let i = 0 ; i < temp_TODO_B.length ; i++)
        {
            temp_TODO_A.push( temp_TODO_B[i] )
        }
        temp_TODO_B = []

    }

    //at this point, temp_TODO_A only has one point left, which is the final LERPING point
    temp_TODO_A[0].ColorFill = "rgba(255,192,0,1)"

    //render from DRAWCALL LIST

    for(let i = 0 ; i < temp_DRAWCALL_lines.length ; i ++)
    {
        ctx.beginPath()
        ctx.moveTo( temp_DRAWCALL_lines[i][0] , temp_DRAWCALL_lines[i][1] )
        ctx.lineTo( temp_DRAWCALL_lines[i][2] , temp_DRAWCALL_lines[i][3] )
        ctx.strokeStyle = "rgba(255,255,255,0.5)"
        ctx.lineWidth = 2
        ctx.stroke()
    }

    for(let i = 0 ; i < temp_DRAWCALL_points.length ; i++)
    {
        temp_DRAWCALL_points[i].drawMe(ctx)
    }

    for(let i = 0 ; i < GLOBAL_shapeList.length ; i++)
    {
        GLOBAL_shapeList[i].drawMe(ctx)
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

    GLOBAL_selectedShape.PosX = temp_mouseX - GLOBAL_dragOffsetX;
    GLOBAL_selectedShape.PosY = temp_mouseY - GLOBAL_dragOffsetY;

    POwO_RedrawAll();
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
        GLOBAL_Tvalue = POwO_Math_Clamp(0,GLOBAL_Tvalue - 1/64,1)
    }
    else if (event.key === "2")
    {
        GLOBAL_Tvalue = POwO_Math_Clamp(0,GLOBAL_Tvalue + 1/64,1)
    }

    console.log("Tvalue : " + GLOBAL_Tvalue)
    POwO_RedrawAll()
})

var GLOBAL_shapeList = [];
var GLOBAL_selectedShape = null;
var GLOBAL_dragOffsetX = 0;
var GLOBAL_dragOffsetY = 0;
var GLOBAL_Tvalue = 0




// ---- ---- ---- ---- RUN MAIN

let smol_P0 = new ShOwOpe(500, 500, 1, "circle", 25, -1, "rgba(0,0,0,0)", 0, "rgba(255,0,0,1)",true,"P0")
let smol_P1 = new ShOwOpe(800, 300, 1, "circle", 25, -1, "rgba(0,0,0,0)", 0, "rgba(255,0,0,1)",true,"P1")
let smol_P2 = new ShOwOpe(800, 700, 1, "circle", 25, -1, "rgba(0,0,0,0)", 0, "rgba(255,0,0,1)",true,"P2")
let smol_P3 = new ShOwOpe(1100, 500, 1, "circle", 25, -1, "rgba(0,0,0,0)", 0, "rgba(255,0,0,1)",true,"P3")


GLOBAL_shapeList.push(smol_P0)
GLOBAL_shapeList.push(smol_P1)
GLOBAL_shapeList.push(smol_P2)
GLOBAL_shapeList.push(smol_P3)

POwO_RedrawAll()

