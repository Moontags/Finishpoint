from pypdf import PdfReader,PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from PIL import Image,ImageOps
from io import BytesIO
import os
path='output/pdf/Mokin_parannukset_pankille_taydennetty.pdf'
r=PdfReader(path);w=PdfWriter()
W,H=595.28,841.89
b=BytesIO();c=canvas.Canvas(b,pagesize=(W,H))
c.setFillColorRGB(.098,.247,.282);c.setFont('Helvetica-Bold',21);c.drawString(56,H-76,'Rantasauna / ulkopinnat')
s=ParagraphStyle('cap',fontName='Helvetica',fontSize=9,leading=12)
items=[('IMG_0244.jpeg','ENNEN','Kuva 21. Rantasaunan aiempi ulkoasu sivulta kuvattuna. Katossa ja piipussa näkyvät aiemmat pinnat.'),('IMG_2828.jpeg','JÄLKEEN / KATTO JA PIIPPU','Kuva 21a. Rantasauna kunnostuksen jälkeen. Kuvassa näkyvät maalattu katto sekä kitattu ja suojamaalattu piippu.'),('40bd0a1a-7e0f-41e7-b57b-28bea6a16e13.jpg','JÄLKEEN / YLEISKUVA','Kuva 22. Rantasauna kunnostuksen jälkeen toisesta suunnasta. Piippu, räystäät ja ikkunanpielet näkyvät kuvassa.')]
for i,(name,label,caption) in enumerate(items):
 top=100+i*225
 c.setFillColorRGB(.098,.247,.282);c.setFont('Helvetica-Bold',9);c.drawString(56,H-top,label)
 im=ImageOps.exif_transpose(Image.open('/Users/jari/Desktop/'+name)).convert('RGB');im.thumbnail((2200,1800));iw,ih=im.size
 scale=min(483/iw,174/ih);a,bb=iw*scale,ih*scale
 c.drawImage(ImageReader(im),56+(483-a)/2,H-top-10-bb,width=a,height=bb)
 p=Paragraph(caption,s);_,h=p.wrap(483,40);p.drawOn(c,56,H-top-190-h)
c.setStrokeColorRGB(.73,.80,.81);c.line(48,42,W-48,42)
c.setFillColorRGB(.31,.38,.41);c.setFont('Helvetica',8);c.drawString(48,25,'Mökkikiinteistön parannukset | Luonnos 6 | 29.10.2026');c.drawRightString(W-48,25,'17')
c.save();new=PdfReader(b).pages[0]
for i,p in enumerate(r.pages):w.add_page(new if i==16 else p)
w.add_metadata({'/Title':'Mökkikiinteistön tehdyt parannukset - Luonnos 6','/Author':'Jari Peltola'})
with open(path+'.tmp','wb') as f:w.write(f)
os.replace(path+'.tmp',path)
print(len(w.pages))
