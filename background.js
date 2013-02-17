var show;
var progress;
var airports;
var airports1;
var citys;
var n;
var fares;
var t;
var c;
var cn;

function json2html(o)
 {var x=function(o)
   {if("object"==typeof(o))
     {if(o==null)
       return(null);
      else
       {var s;
        if(o instanceof Array)
         {s="<ol start=0>";
          for(var k=0;k<o.length;k++)
           {var v=o[k];
            if(undefined!==v)
             {v=x(v);
              s+="<li"+(v!=null?"":" type=\"circle\"")+">"+v+"<"+"/li>";
             }
            else
             {s+="<li type=\"disc\">"+v+"<"+"/li>";
             }
           }
          s+="<"+"/ol>";
         }
        else
         {s="<table border=1>";
          for(var k in o)
           {var v=x(o[k]);
            s+="<tr>"+(v!=null?"<td>"+k+"<"+"/td><td>"+v+"<"+"/td>":"<th colspan=2>"+k+"<"+"/th>")+"<tr>";
           }
          s+="<"+"/table>"
         }
        return(s);
       }
     }
    else
     return(o.toString());
   }
  return(x(o));
 }

function airport2city(a)
 {if(3!=a.length || a.toUpperCase()!=a)
   {alert(a);
    return("");
   }
  else
   {var r="";
    http=new XMLHttpRequest();
    http.onreadystatechange=function()
     {if(http.readyState==4)
       {if(http.status!=200)
         {throw(http.status);
         }
        else
         {if("{userInput:\""+a+"\",result:[]}\n"==http.responseText)
           {alert("未知机场: "+a);
           }
          else
           {var c=JSON.parse(http.responseText);
            if(a!=c.userInput)
             {throw(c.userInput);
             }
            else
             {c.result.forEach
               (function(e)
                 {if(3==e.type && "中国"==e.country && e.display==e.key+'('+a+')')
                   r=e.key;
                 }
               );
              if(""==r)
               {alert("未能完全匹配，请人工查询: "+a);
               }
             }
           }
         }
       }
     }
    http.open("GET","http://www.qunar.com/suggest/livesearch2.jsp?q="+a+"",false);
    chrome.cookies.set({"url":"http://www.qunar.com","domain":"qunar.com","name":"QN99","value":""+(new Date).getTime()});
    http.send(null);
    return(r);
   }
 }

function fresh()
 {var min={};
  for(k1 in fares)
   for(k2 in fares[k1])
    for(k3 in fares[k1][k2])
     for(k4 in fares[k1][k2][k3])
      {if(undefined===min[airports[k3]]) min[airports[k3]]={};
       if(undefined===min[airports[k3]][airports[k4]]) min[airports[k3]][airports[k4]]=9999999;
       if(0<fares[k1][k2][k3][k4][2] && min[airports[k3]][airports[k4]]>fares[k1][k2][k3][k4][2]) min[airports[k3]][airports[k4]]=fares[k1][k2][k3][k4][2];
      }
  var through=[];
  var transfer=[];
  var city=[];
  for(k1 in min)
   for(k2 in min[k1])
    {if(undefined!==c[0][k1] && undefined!==c[1][k2])
      through.push([k1+'|'+k2,min[k1][k2]]);
     if(undefined!==c[0][k1] && 1==c[0][k1])
      for(k3 in c[1])
       if(undefined!==min[k2] && undefined!==min[k2][k3])
        {if(undefined===min[k1][k3])
          transfer.push([k1+'|'+k2+'|'+k3,min[k1][k2]+'+'+min[k2][k3],min[k1][k2]+min[k2][k3]]);
         else if(min[k1][k3]>min[k1][k2]+min[k2][k3])
          transfer.push([k1+'|'+k2+'|'+k3,min[k1][k2]+'+'+min[k2][k3],min[k1][k2]+min[k2][k3],min[k1][k2]+min[k2][k3]-min[k1][k3]]);
         city.push(k2);
        }
     if(undefined!==c[1][k2] && 1==c[1][k2])
      for(k0 in c[0])
       if(undefined!==min[k0] && undefined!==min[k0][k1])
        {if(undefined===min[k0][k2])
          transfer.push([k0+'|'+k1+'|'+k2,min[k0][k1]+'+'+min[k1][k2],min[k0][k1]+min[k1][k2]]);
         else if(min[k0][k2]>min[k0][k1]+min[k1][k2])
          transfer.push([k0+'|'+k1+'|'+k2,min[k0][k1]+'+'+min[k1][k2],min[k0][k1]+min[k1][k2],min[k0][k1]+min[k1][k2]-min[k0][k2]]);
         city.push(k1);
        }
    }
  through=through.sort(function(a,b){return(a[1]-b[1])});
  transfer=transfer.sort(function(a,b){return(a[2]-b[2])}).filter(function(e,i,a){return(0!=i?a[i-1][0]==e[0]?0:1:1);});
  var i=0;
  input.airports2.value="";
  city=city.sort().filter(function(e,i,a){return(0!=i?a[i-1]==e?0:1:1);}).forEach
   (function(e)
     {for(k in citys[e])
       {if(undefined===airports1[k])
         {input.airports2.value+='"'+k+'":"'+e+'",';
          i++;
         }
       }
     }
   );
  document.getElementById("airports2_n").innerHTML=i+"个";
  show.innerHTML=json2html([through,transfer,fares]);
 }

function dateStr(d)
 {var month=1+d.getMonth();
  if(month<10) month='0'+month;
  var date=d.getDate();
  if(date<10) date='0'+date;
  return(d.getFullYear()+'-'+month+'-'+date);
 }

function input_check()
 {var i;
  try
   {i=JSON.parse('{'+input.airports0.value.replace(/\s{1,}/g,'').slice(0,-1)+'}');
   }
  catch(e)
   {alert(e);
    return(false);
   }
  c=[];
  for(e in i)   
   {if(""==i[e])
     {i[e]=airport2city(e);
      if(""==i[e])
       return(false);
     }
    c.push([i[e],e]);
   }
  airports={};
  citys={};
  n=0;
  input.airports0.value="";
  i=0;
  c.sort().forEach
   (function(e)
     {airports[e[1]]=e[0];
      if(undefined===citys[e[0]])
       {citys[e[0]]={};
        n++;
       }
      citys[e[0]][e[1]]='';
      input.airports0.value+='"'+e[1]+'":"'+e[0]+'",';
      i++;
     }
   );
  document.getElementById("airports0_n").innerHTML=i+"个";
  c=[{},{}];
  cn={0:{0:0,1:0},1:{0:0,1:0}};
  i={0:{0:input.d0,1:input.d1},1:{0:input.a0,1:input.a1}};
  var e=true;
  for(k1 in i)
   for(k2 in i[k1])
    {i[k1][k2].value=i[k1][k2].value.trim(/\s{1,}/g).replace(/\s{1,}/g,' ');
     if(0<i[k1][k2].value.length)
      {i[k1][k2].value.split(' ').forEach
        (function(k)
          {if(undefined===citys[k])
            {alert("Unknown City: "+k);
             e=false;
            }
           else
            {if(undefined!==c[0][k] || undefined!==c[1][k])
              {alert("Duplicated City: "+k);
               e=false;
              }
             else
              {c[k1][k]=k2;
               cn[k1][k2]++;
              }
            }
          }
        );
      }
    }
  if(e)
   {try
     {e=JSON.parse('{'+input.airports1.value.replace(/\s{1,}/g,'').slice(0,-1)+'}');
     }
    catch(e)
     {alert(e);
      return(false);
     }
    for(i in e)
     {if(undefined===airports[i])
       {alert(i);
        return(false);
       }
      else if(e[i]!=airports[i])
       {alert(e[i]+"!="+airports[i]);
        return(false);
       }
     }
    c.forEach
     (function(i)
       {for(k1 in i)
         for(k2 in citys[k1])
          e[k2]=k1;
       }
     );
    airports1={};
    input.airports1.value="";
    i=0;
    for(k1 in airports)
     if(undefined!==e[k1])
      {airports1[k1]=airports[k1];
       input.airports1.value+='"'+k1+'":"'+airports1[k1]+'",';
       i++;
      }
    document.getElementById("airports1_n").innerHTML=i+"个";
    try
     {e=JSON.parse('{'+input.airports2.value.replace(/\s{1,}/g,'').slice(0,-1)+'}');
     }
    catch(e)
     {alert(e);
      return(false);
     }
    input.airports2.value="";
    i=0;
    for(k1 in e)
     if(undefined===airports1[k1])
      {input.airports2.value+='"'+k1+'":"'+e[k1]+'",';
       i++;
      }
    document.getElementById("airports2_n").innerHTML=i+"个";
    return(true);
   }
  else return(false);
 }
 
function search()
 {if(input_check())
   {t=input.t0.value;
    fares={};
    input.search.disabled=true;
    input.search.value="检索中……";
    progress.max=(cn[0][1]+cn[1][1])*n+cn[0][0]*cn[1][0]-cn[0][1]*cn[1][1]-cn[0][1]-cn[1][1];
    progress.value=0;
    var w=new Worker("worker.js");
    var start=(new Date).getTime();
    w.onmessage=function(e)
     {switch(e.data[0])
       {case 1:
         chrome.cookies.set({"url":"http://flight.qunar.com","domain":"qunar.com","name":"QN99","value":""+e.data[1]});
         break;
        case 2:
         progress.value=e.data[1];
         input.search.value=parseInt(((new Date).getTime()-start)*(progress.max-progress.value)/progress.value/1000,10);
         break;
        case 3:
         fares=e.data[1];
         fresh();
         input.search.value="检索";
         input.search.disabled=false;
         break;
        case -1:
         alert(e.data[1]);
         return;
        default:
         throw("Unknown Command: "+e.data[0]);
        }
     };
    chrome.cookies.set({"url":"http://flight.qunar.com","domain":"qunar.com","name":"QN99","value":""+start});
    w.postMessage([citys,t,c]);
   }
 }

function swap()
 {if(input_check())
   {var t;
    t=input.d0.value;
    input.d0.value=input.a0.value;
    input.a0.value=t;
    t=input.d1.value;
    input.d1.value=input.a1.value;
    input.a1.value=t;
   }
 }

 function init()
 {if(undefined!==document.forms.input && input_check())
   {input.t0.value=dateStr(new Date((new Date).getTime()+1*86400000));
    show=document.getElementById("show");
    input.search.onclick=search;
    input.search.disabled=false;
    input.swap.onclick=swap;
    progress=document.getElementById("progress");
    //search();
   }
 }
 
document.addEventListener('DOMContentLoaded',init);
