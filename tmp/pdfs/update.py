from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor,white
from pypdf import PdfReader,PdfWriter
from PIL import Image,ImageOps
from io import BytesIO
from pathlib import Path
W,H=595.28,841.89
ink=HexColor('#193f48'); gray=HexColor('#4e6268')
style=ParagraphStyle('body',fontName='Helvetica',fontSize=10.5,leading=15,textColor=HexColor('#18262a'))
def para(c,text,x,top,width=483,size=None):
 s=style if size is None else ParagraphStyle('cap',parent=style,fontSize=size,leading=size+4)
 p=Paragraph(text,s); _,h=p.wrap(width,700);p.drawOn(c,x,H-top-h);return top+h
def wipe(c,x,top,w,h):
 c.setFillColor(white);c.rect(x,H-top-h,w,h,fill=1,stroke=0)
def footer(c,num):
 wipe(c,40,803,515,24); c.setStrokeColor(HexColor('#bbcdcf'));c.line(48,42,W-48,42)
 c.setFillColor(gray);c.setFont('Helvetica',8);c.drawString(48,25,'Mökkikiinteistön parannukset | Luonnos 6 | 29.10.2026');c.drawRightString(W-48,25,str(num))
def title(c,t):
 c.setFillColor(ink);c.setFont('Helvetica-Bold',21);c.drawString(56,H-76,t)
def photo(c,name,top,boxh):
 im=ImageOps.exif_transpose(Image.open('/Users/jari/Desktop/'+name)).convert('RGB'); im.thumbnail((2200,2200))
 iw,ih=im.size; sc=min(483/iw,boxh/ih);w,h=iw*sc,ih*sc
 c.drawImage(ImageReader(im),56+(483-w)/2,H-top-h,width=w,height=h)
 return top+h
source=PdfReader('/Users/jari/Desktop/Mokin_parannukset_pankille.pdf');out=PdfWriter()
for n,page in enumerate(source.pages):
 b=BytesIO();c=canvas.Canvas(b,pagesize=(W,H));footer(c,n+1)
 if n==0:
  wipe(c,54,193,485,18);c.setFillColor(HexColor('#18262a'));c.setFont('Helvetica',10.5);c.drawString(56,H-205,'Luonnos 6 | 29.10.2026 | Laatija: Jari Peltola')
  wipe(c,54,243,487,79)
  para(c,'Selvitys on laadittu mökkikokonaisuuden nykytilan ja tehtyjen parannusten arviointia sekä nykyisen asunnon pantin vapauttamista koskevan pankkikäsittelyn tueksi. Se käsittelee kulkuyhteyksiä, laituria ja rantaa, sisätiloja sekä kattojen, piippujen, rakennusten ulkopintojen ja saunan kunnostuksia.',56,246)
 if n==1:
  wipe(c,54,609,488,58);c.setFillColor(ink);c.setFont('Helvetica-Bold',14);c.drawString(56,H-625,'Täydennetyt osiot')
  para(c,'Kattojen, piippujen ja ulkopintojen kunnostukset, saaren kulut sekä saunan vahaus ja uudet vertailukuvat on lisätty sivuille 14-18.',56,635)
 c.save();page.merge_page(PdfReader(b).pages[0]);out.add_page(page)
b=BytesIO();c=canvas.Canvas(b,pagesize=(W,H));title(c,'04 / Huolto- ja parannustyöt')
y=para(c,'<b>Toteutus: viimeisten kolmen vuoden aikana</b><br/>Omistajan ilmoituksen mukaan seuraavat työt on tehty viimeisten kolmen vuoden aikana.',56,101)
y=para(c,'<b>Katot ja piiput</b><br/>Rakennusten katot on maalattu. Piiput on kitattu ja suojamaalattu.',56,y+18)
y=para(c,'<b>Rakennusten ulkopinnat ja kulut</b><br/>Rakennuksia on suojamaalattu. Saaren alueelle on tehty ja parannettu kulkuja. Vertailukuvissa näkyvät päämökin ulkoasun muutos sekä rantaan johtava puinen kulkuväylä ja rannan oleskelutasot.',56,y+18)
y=para(c,'<b>Sauna</b><br/>Sauna on vahattu. Ennen- ja jälkeen-kuvissa näkyy saunan puupintojen muutos vaaleasta puunsävystä tummaksi.',56,y+18)
y=para(c,'<b>Kuvien ja tietojen tulkinta</b><br/>Työselostus ja toteutusaikaväli perustuvat omistajan ilmoitukseen. Vertailuparit on järjestetty kuvissa näkyvien muutosten perusteella. Tarkkoja kuvauspäiviä, työkohtaisia vuosia, tuotteita tai kustannuksia ei ole ilmoitettu. Kattojen ja piippujen käsittelystä ei ole erillisiä lähikuvia tässä aineistossa.',56,y+18)
y=para(c,'<b>Lisäkuva / sisätila</b>',56,y+18)
e=photo(c,'IMG_2853.jpeg',y+10,205);para(c,'Kuva 16. Täydentävä yleiskuva mökin sisätilasta: vaaleat seinä- ja kattopinnat. Kuva ei yksilöi uutta erillistä työvaihetta.',56,e+7,size=9)
footer(c,14);c.showPage()
pairs=[('Päämökki / ennen ja jälkeen','c5b87fd2-8cc9-4f15-a211-eee1dd2e58bd.jpg','IMG_0468.jpeg','Päämökin ulkopinnat ennen kunnostusta.','Päämökin ulkoasu kunnostuksen jälkeen. Omistajan mukaan rakennuksia on suojamaalattu.'),('Saaren kulut / ennen ja jälkeen','9df43e21-4cbe-4930-b92c-47bc4c6d4e8d.jpg','h.png','Rantaan johtava maastopolku ja aiempi rantaympäristö.','Rantaan johtava puinen kulkuväylä sekä rannan tasanteet.'),('Rantasauna / ulkopinnat','IMG_0244.jpeg','40bd0a1a-7e0f-41e7-b57b-28bea6a16e13.jpg','Rantasaunan aiempi ulkoasu sivulta kuvattuna. Katossa ja piipussa näkyvät aiemmat pinnat.','Rantasauna kunnostuksen jälkeen toisesta suunnasta. Piippu, räystäät ja ikkunanpielet näkyvät kuvassa.'),('Sauna / ennen ja jälkeen','40ff642c-9b24-4677-a8e6-f9aa55e1e0d1.jpg','09.jpg','Saunan puunsävyiset seinät, katto ja lauteet ennen vahausta.','Saunan tummat puupinnat vahauksen jälkeen.')]
for i,(t,a,bn,ca,cb) in enumerate(pairs):
 title(c,t)
 for j,(name,cap) in enumerate([(a,ca),(bn,cb)]):
  top=104+j*342
  c.setFillColor(ink);c.setFont('Helvetica-Bold',10);c.drawString(56,H-top, 'ENNEN' if j==0 else 'JÄLKEEN')
  end=photo(c,name,top+12,278)
  para(c,f'Kuva {17+i*2+j}. {cap}',56,end+8,size=9)
 footer(c,15+i);c.showPage()
c.save()
for p in PdfReader(b).pages:out.add_page(p)
out.add_metadata({'/Title':'Mökkikiinteistön tehdyt parannukset - Luonnos 6','/Author':'Jari Peltola'})
path='output/pdf/Mokin_parannukset_pankille_taydennetty.pdf'
with open(path,'wb') as f:out.write(f)
print(path,len(out.pages))
