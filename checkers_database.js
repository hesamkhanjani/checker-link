import https from 'https'
import dns from 'dns'
import http from 'http'
 

class CheckLinks{
 
    caller(link){
      return new Promise((resolve , rejects)=>{
        var str = ''
        this.redirectCheck(link, (error, isRedirect, redirectUrl) => {
            if (error) {
                console.error('Error:', error);
            } else if (isRedirect) {
                this.checkByStatusCode(link).then(data=>{
                    str = data + "\n"
                    this.dnsCheck(link).then(data2=>{
                        if(redirectUrl.slice(8 , 11) == "www"){
                            
                            str = str + data2 + "\n" + `The link ${link} does not redirect`
                            resolve(str)
                            this.show(str) 
                        }else{
                            str = str + data2 + "\n" + `# The link ${link} redirects to ${redirectUrl}`
                            resolve(str)

                            this.show(str) 
                        }
                         
        
                    })
                    
                 })
              ;
            } else {
            
                this.checkByStatusCode(link).then(data=>{
                    str = data + "\n"
                    this.dnsCheck(link).then(data2=>{
        
                        str = str + data2 + "\n" + `The link ${link} does not redirect`
                        resolve(str)

                    })
                })

              
            }
          });
        
        
    
    
      })
        
    }
   

    checkByStatusCode(link ){ 
        var url = new URL(link)

        const protocol = url.protocol === "https:" ? https : http
        var hostname = link;
        return new Promise((resolve , rejects)=>{
            try {
                protocol.get(hostname, (res ) => {
                
                if (res.statusCode == 495) {
                    resolve ("# SSL is not enabled on");
                } else if(res.statusCode == 200){
                    resolve("everthink OK")
                }else if(res.statusCode == 408){
                    resolve("# timeout err")
                }else if(res.statusCode == 504){
                    resolve("# Gatway timeout ")
                }else if (res.statusCode == 301){
                    resolve("this for any redirect(maby to (WWW.) ). statusCode: 301")
                }
                else {
                    resolve("# we have problme. statusCode: " + res.statusCode);
                    
                    }
    
            }).on('error', (err) => {
               
                rejects(err)
            });
            }catch(error){
                rejects(error)
            }
        })
        


}

     dnsCheck(link){
        const url = new URL(link)
        
        var text = ''  
        if(url.protocol == "https:"){
        text  = link.substring(8);

        return new Promise((resolve , rejects)=>{
            dns.resolve(text, (error, addresses) => {
                if (error) {
                  resolve('# DNS resolution failed: '+ error);
                } else {
                  resolve('DNS resolution succeeded.') ;
                }
              });
        }) 
    }else{
        text  = link.substring(7);

        return new Promise((resolve , rejects)=>{
            dns.resolve(text, (error, addresses) => {
                if (error) {
                  resolve('# DNS resolution failed: '+ error);
                } else {
                  resolve('DNS resolution succeeded.') ;
                }
              });
        }) 
    }
}
        
        
     redirectCheck(link , callback){


            
            const url = new URL(link);
        
            const httpClient = url.protocol === 'https:' ? https : http;
        try {
            const req = httpClient.get(link, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                callback(null, true, res.headers.location);
            } else {
                callback(null, false);
            }
            });
        
            req.on('error', (error) => {
            callback(error);
            });
        
            req.end();
        }catch(error) {
            console.error(error)
        }
  
  
        
    }
}


var check  = new CheckLinks()

function run(data){
   return new Promise((resolve , rejects)=>{
      check.caller(data).then(data=> {
        resolve( data) 
      })
    })
}

export default run


