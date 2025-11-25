import React,{createContext,useState} from "react"

export const ColorContext = createContext();

export const ColorIndex = {
  BASIC : 0,
  DISTINCT: 1,
  EXTRA : 2,
  SCARCE:3,
}

export const IBColors = false?{
  background : ["#0af","#02a"],
  surface : ["#09e","#fff","#00f","#9af"],
  layer : ["#eee","#35f","#fff"],
  alert : ["#f00"],
  
  background_alpha : ["#0003","#eefe"],
  surface_alpha : ["#02f5","#5555","#07ca"],
  layer_alpha : ["#33f5","#8855"],
  
  elements:["#fff","#000"],
  design : ["#ccf"]
}:{
  background:["#fa0","#a20"],
  surface:["#e90","#fff","#f00","#fa9"],
  layer:["#eee","#f53","#fff"],
  alert:["#00f"],
  
  background_alpha:["#0003","#feee"],
  surface_alpha:["#f205","#5555","#c70a"],
  layer_alpha:["#f335","#5885"],
  
  elements:["#fff","#000"],
  design:["#fcc"]
}

export const DefaultScheme = {
  "levels": 4,
  "width": 2,
  "name": "SkyBlueClarity",
  "scheme": {
    "bkg": "#00AAFF",
    "elm": "#111111",
    "inn": [
      {
        "bkg": "#FFFFFF",
        "elm": "#111111",
        "inn": [
          {
            "bkg": "#F0F0F0",
            "elm": "#111111",
            "inn": [
              {
                "bkg": "#E0E0E0",
                "elm": "#111111",
                "inn": []
              },
              {
                "bkg": "#C8E8F0",
                "elm": "#111111",
                "inn": []
              }
            ]
          },
          {
            "bkg": "#AADDF0",
            "elm": "#111111",
            "inn": [
              {
                "bkg": "#00AAFF",
                "elm": "#FFFFFF",
                "inn": []
              },
              {
                "bkg": "#D9D9D9",
                "elm": "#111111",
                "inn": []
              }
            ]
          }
        ]
      },
      {
        "bkg": "#0088CC",
        "elm": "#FFFFFF",
        "inn": [
          {
            "bkg": "#005599",
            "elm": "#FFFFFF",
            "inn": [
              {
                "bkg": "#003366",
                "elm": "#FFFFFF",
                "inn": []
              },
              {
                "bkg": "#A3C6E5",
                "elm": "#111111",
                "inn": []
              }
            ]
          },
          {
            "bkg": "#77C8F7",
            "elm": "#111111",
            "inn": [
              {
                "bkg": "#48A2D7",
                "elm": "#FFFFFF",
                "inn": []
              },
              {
                "bkg": "#FFFFFF",
                "elm": "#111111",
                "inn": []
              }
            ]
          }
        ]
      }
    ]
  }
}

export const DefaultScheme2 = {
  levels : 4,
  width:2,
  scheme:{
  "bkg": "#FDF3D0",
  "elm": "#2C3E50",
  "inn": [
    {
      "bkg": "#FFD369",
      "elm": "#2C3E50",
      "inn": [
        {
          "bkg": "#FFEEAA",
          "elm": "#2C3E50",
          "inn": [
            {
              "bkg": "#F59300",
              "elm": "#FFFFFF",
              "inn": []
            },
            {
              "bkg": "#88B04B",
              "elm": "#FFFFFF",
              "inn": []
            }
          ]
        },
        {
          "bkg": "#88B04B",
          "elm": "#FFFFFF",
          "inn": [
            {
              "bkg": "#A4C767",
              "elm": "#2C3E50",
              "inn": []
            },
            {
              "bkg": "#6B8E23",
              "elm": "#FFFFFF",
              "inn": []
            }
          ]
        }
      ]
    },
    {
      "bkg": "#E8F8F9",
      "elm": "#2C3E50",
      "inn": [
        {
          "bkg": "#C8E8F8",
          "elm": "#2C3E50",
          "inn": [
            {
              "bkg": "#4AB1D8",
              "elm": "#FFFFFF",
              "inn": []
            },
            {
              "bkg": "#AADFE8",
              "elm": "#2C3E50",
              "inn": []
            }
          ]
        },
        {
          "bkg": "#4AB1D8",
          "elm": "#FFFFFF",
          "inn": [
            {
              "bkg": "#1E88A8",
              "elm": "#FFFFFF",
              "inn": []
            },
            {
              "bkg": "#D3D3D3",
              "elm": "#2C3E50",
              "inn": []
            }
          ]
        }
      ]
    }
  ]
}
}

export const DefaultScheme1 = {
  "levels": 4,
  "width": 2,
  "name": "SkyBlueClarity",
  "scheme": {
    "bkg": "#00AAFF",
    "elm": "#111111",
    "inn": [
      {
        "bkg": "#0088CC",
        "elm": "#FFFFFF",
        "inn": [
          {
            "bkg": "#005599",
            "elm": "#FFFFFF",
            "inn": [
              {
                "bkg": "#003366",
                "elm": "#FFFFFF",
                "inn": []
              },
              {
                "bkg": "#A3C6E5",
                "elm": "#111111",
                "inn": []
              }
            ]
          },
          {
            "bkg": "#77C8F7",
            "elm": "#111111",
            "inn": [
              {
                "bkg": "#48A2D7",
                "elm": "#FFFFFF",
                "inn": []
              },
              {
                "bkg": "#FFFFFF",
                "elm": "#111111",
                "inn": []
              }
            ]
          }
        ]
      },
      {
        "bkg": "#FFFFFF",
        "elm": "#111111",
        "inn": [
          {
            "bkg": "#F0F0F0",
            "elm": "#111111",
            "inn": [
              {
                "bkg": "#E0E0E0",
                "elm": "#111111",
                "inn": []
              },
              {
                "bkg": "#C8E8F0",
                "elm": "#111111",
                "inn": []
              }
            ]
          },
          {
            "bkg": "#AADDF0",
            "elm": "#111111",
            "inn": [
              {
                "bkg": "#00AAFF",
                "elm": "#FFFFFF",
                "inn": []
              },
              {
                "bkg": "#D9D9D9",
                "elm": "#111111",
                "inn": []
              }
            ]
          }
        ]
      }
    ]
  }
}

export const BKG = "bkg";
export const ELM = "elm";
export const getColor = (theme,link)=>{
  let level = theme.scheme;
  if(link){
    const level_upper_bound = Math.min(link.length,theme.levels);
    for(let i = 0;i<level_upper_bound;i++){
      let step = link[i];
      const step_max = Math.min(step,theme.width-1);
      if(step>=step_max) step=step_max;
      while(!level.inn[step] && step>=0){
        step = step - 1;
      }
      if(step>=0){
        level = level.inn[step];
      }
      else{
        break;
      }
    }
  }
  return level;
}

export const getColorStyle = (theme,level)=>{
  const color = getColor(theme,level);
  //console.log(level," => (",color.bkg,",",color.elm,")");
  return {
    bkg : {backgroundColor:color.bkg},
    elm : {color:color.elm,borderColor:color.elm},
    _bkg:color.bkg,
    _elm:color.elm,
    bkga:(a)=>({backgroundColor:color.bkg+a}),
    elma:(a)=>({color:color.elm+a,borderColor:color.elm+a}),
    _bkga:(a)=>color.bkg+a,
    _elma:(a)=>color.elm+a,
  }
}