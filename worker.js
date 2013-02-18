var E;

function postError(e)
 {E=true;
  postMessage([-1,e]);
 }

function fare(citys,t,d,a,fares)
 {postMessage([1,(new Date).getTime()]);
  http1=new XMLHttpRequest();
  http1.onreadystatechange=function()
   {if(http1.readyState==4)
     {if(http1.status!=200)
       postError("http1.status=="+http1.status+"!=200");
      else
       {http2=new XMLHttpRequest();
        http2.onreadystatechange=function()
         {if(http2.readyState==4)
           {if(http2.status!=200)
             postError("http2.status=="+http2.status+"!=200");
            else
             {if("{isLimit:true}"==http2.responseText)
               {postError("CAPTCHA");
                /*fare(t,d,a);*/
               }
              else
               {if(http2.responseText[0]!='(' || http2.responseText[http2.responseText.length-1]!=')')
                 postError("Unknown responseText: "+http2.responseText);
                else
                 {var r=JSON.parse(http2.responseText.slice(1,-1));
                  if("[]"!=r.errorInfo)
                   {if("[INVALID_AIRLINE]"!=r.errorInfo)
                     postError(t+' '+d+' '+a+" ServerError: "+r.errorInfo);
                   }
                  else
                   {for(k in r.oneway_data.priceInfo)
                     {if(undefined===r.oneway_data.flightInfo[k])
                       postError("flightInfo NOT found: "+k);
                      else
                       {var e=k.split("|");
                        if(2!=e.length)
                         postError("2!=split(\"|\").length : "+k);
                        else
                         {if(e[1]!=t)
                           postError("Date NOT uniform: "+t+" <> "+e[1]);
                          else
                           e=e[0];
                          if(r.oneway_data.flightInfo[k].dd!=t)
                           postError("dd NOT uniform: "+t+" <> "+r.oneway_data.flightInfo[k].dd);
                          else
                           {if(r.oneway_data.flightInfo[k].co!=e)
                             postError("co NOT identical: "+e+" <> "+r.oneway_data.flightInfo[k].co);
                            else
                             {if(undefined===citys[d][r.oneway_data.flightInfo[k].da])
                               postError("Unknown Departure "+d+" AirPort: "+r.oneway_data.flightInfo[k].da);
                              else
                               {if(undefined===citys[a][r.oneway_data.flightInfo[k].aa])
                                 postError("Unknown Arrival "+a+" AirPort: "+r.oneway_data.flightInfo[k].aa);
                                else
                                 {if(undefined===r.oneway_data.priceInfo[k].lowpr)
                                   postError("lowpr NOT found: "+k);
                                  else
                                   {if(undefined===fares[t]) fares[t]={};
                                    if(undefined===fares[t][e]) fares[t][e]={};
                                    if(undefined===fares[t][e][r.oneway_data.flightInfo[k].da]) fares[t][e][r.oneway_data.flightInfo[k].da]={};
                                    if(undefined===fares[t][e][r.oneway_data.flightInfo[k].da][r.oneway_data.flightInfo[k].aa])
                                     fares[t][e][r.oneway_data.flightInfo[k].da][r.oneway_data.flightInfo[k].aa]=[r.oneway_data.flightInfo[k].dt,r.oneway_data.flightInfo[k].at,r.oneway_data.priceInfo[k].lowpr];
                                    else
                                     postError("Should Not Queryed: "+t+" "+e+" "+r.oneway_data.flightInfo[k].da+" "+r.oneway_data.flightInfo[k].aa);
                                   }
                                 }
                               }
                             }
                           }
                         }
                       }
                     }
                    //fresh();
                   }
                 }
               }
             }
           }
         }
        http2.open("GET","http://flight.qunar.com/twell/longwell?tags=1&searchType=OneWayFlight&http%3A%2F%2Fwww.travelco.com%2FsearchDepartureTime="+t+"&http%3A%2F%2Fwww.travelco.com%2FsearchDepartureAirport="+encodeURIComponent(d)+"&http%3A%2F%2Fwww.travelco.com%2FsearchArrivalAirport="+encodeURIComponent(a),false);
        try
         {http2.send(null);}
        catch(e)
         {postError("Connection2 Error: "+e);
         }
       }
     }
   };
  http1.open("GET","http://flight.qunar.com/twell/images/Lw_AdsDotLine.gif?"+(new Date()).getTime(),false);
  try
   {http1.send(null);}
  catch(e)
   {postError("Connection1 Error: "+e);
   }
 }
 
 onmessage=function(e)
 {E=false;
  var citys=e.data[0];
  var t=e.data[1];
  var c=e.data[2];
  var fares={};
  var i=0;
  for(k1 in c[0])
   for(k2 in citys)
    if(false==E && ((1==c[0][k1] && k1!=k2) || (0==c[0][k1] && 0==c[1][k2])))
     {fare(citys,t,k1,k2,fares);
      postMessage([2,++i]);
     }
  for(k1 in citys)
   for(k2 in c[1])
    if(false==E && (1==c[1][k2] && k1!=k2 && (undefined===c[0][k1] || 0==c[0][k1])))
     {fare(citys,t,k1,k2,fares);
      postMessage([2,++i]);
     }
  postMessage([3,fares]);
 }