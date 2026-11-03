import base64, json, glob, os
s=open('shell.html').read()
imgs={os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+base64.b64encode(open(f,'rb').read()).decode() for f in sorted(glob.glob('img/*.jpg'))}
of={"urak-taar":"v13-urak-taar","taurus":"taurus","taurus-aqshy":"taurus","war-despot":"v13-war-despot","daemonsmith":"v13-daemonsmith","ashen-elder":"v13-ashen-elder",
"dominator-cannons":"v13-dominator","dominator-maces":"v13-dominator","razers-blunder":"v13-infernal-razers","razers-flame":"razers-flame",
"cohort-spears":"v13-infernal-cohort","cohort-blades":"v13-infernal-cohort","bull-centaurs":"v13-bull-centaurs","sentinels":"v13-sentinels",
"sentinels-aqshy":"sentinels-aqshy","bombard":"v13-tormentor-bombard","deathshrieker":"v13-deathshrieker","hobgrotz":"v13-hobgrotz",
"armee":"armee","sorts":"v13-sorts","prieres":"v13-prieres","tactiques":"tactiques"}
data=open('data.js').read()+"\n  const IMG = "+json.dumps(imgs)+";\n  const PHOTO_OF = "+json.dumps(of)+";\n"
s=s.replace('/*DATA*/',data).replace('/*APP*/',open('app.js').read())
open('mega-forge.html','w').write(s)
open('/tmp/claude-0/check.js','w').write("(function(){"+data+open('app.js').read().replace('route();\n','')+"})")
print(len(s))
