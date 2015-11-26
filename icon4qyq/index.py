# -*- coding:utf-8 -*-
import re;
classes = open('icon.css','r',encoding='utf-8');
try:
    texts = classes.read();
    if(texts):
        re_cls = re.compile(r'\.icon_\w+ ');
        match = re.findall(re_cls,texts);
        html = open('icons.html','w');
        allclasses = '';
        for k in match:
            print(type(k));
            allclasses += '<i class="i '+(k[1:-1])+'"></i>\n';
        codes = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>icons 4 qyq</title>
    <link rel="stylesheet" href="icon.css" />
</head>
<body>

"""+allclasses+'</body></html>';
        html.write(codes);
        html.close();
        print(codes);
        #while(match):
        #    print(match);
        #    match = re.search(re_cls,texts);
        
finally:
    classes.close();
#print(texts);
