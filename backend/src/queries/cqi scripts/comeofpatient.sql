 
  select pr.querter,Early, round((Early/(Early+ Schedule+ Late_in_buffer+ Late_Beyond_Buffer))*100,2) as '% Early',Schedule, round((Schedule/(Early+ Schedule+ Late_in_buffer+ Late_Beyond_Buffer))*100,2) as '% Schedule',Late_in_buffer,round( (Late_in_buffer/(Early+ Schedule+ Late_in_buffer+ Late_Beyond_Buffer)*100),2) as '% Late_in_buffer',Late_Beyond_Buffer,round((Late_Beyond_Buffer/(Early+ Schedule+ Late_in_buffer+ Late_Beyond_Buffer))*100,2) as '% Late_Beyond_Buffer' from ( 

 select lr.querter, ifnull(Max( case when lr.Status_come='Early' then lr.numbervisit end),'0') as 'Early',  ifnull(Max( case when lr.Status_come='Schedule' then lr.numbervisit end),'0') as 'Schedule',  ifnull(Max( case when lr.Status_come='Late in buffer' then lr.numbervisit end),'0') as 'Late_in_buffer', ifnull(Max( case when lr.Status_come='Late Beyond Buffer' then lr.numbervisit end),'0') as 'Late_Beyond_Buffer'  from ( 


 select al.querter,al.Status_come,count(al.querter) as numbervisit  from (
select  fi.clinicid, fi.DatVisit,concat( quarter(fi.DatVisit),'-',year(fi.DatVisit)) as querter, fi.DaApp as tthisapp, si.DaApp as lastapp,if(datediff(fi.datvisit,si.daapp)<0,'Early',if(datediff(fi.datvisit,si.daapp)=0,'Schedule',if(datediff(fi.datvisit,si.daapp)>0 and datediff(fi.datvisit,si.daapp)<=5 ,'Late in buffer',if(datediff(fi.datvisit,si.daapp)>5,'Late Beyond Buffer','Firstvisit')))) as Status_come from 
(select  @row_number:=CASE  WHEN @customer_no = clinicid 	THEN @row_number + 1  ELSE 1 end as numid ,@customer_no:=clinicid clinicid,DatVisit,DaApp from tblavmain, (SELECT @customer_no:=0,@row_number:=0) r
order by clinicid,DatVisit ) fi
left join
(select  @row_number:=CASE  WHEN @customer_no = clinicid 	THEN @row_number + 1  ELSE 1 end as numid ,@customer_no:=clinicid clinicid,DatVisit,DaApp from tblavmain, (SELECT @customer_no:=0,@row_number:=0) r
order by clinicid,DatVisit) si on fi.clinicid=si.clinicid and fi.numid=si.numid+1

 ) al group by al.querter,al.Status_come
 
 ) lr  Group by lr.querter
 
 ) pr  order by right(pr.querter,4),left(pr.querter,1)