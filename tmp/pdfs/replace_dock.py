from pypdf import PdfReader,PdfWriter
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from PIL import Image,ImageOps
from io import BytesIO
path='output/pdf/Mokin_parannukset_pankille_taydennetty.pdf'
r=PdfReader(path);w=PdfWriter();w.clone_document_from_reader(r)
p=w.pages[6]
print([(im.name,im.image.size) for im in p.images])
# Locate the lower image by its second draw instruction, not resource ordering.
from pypdf.generic import ContentStream
cs=ContentStream(p.get_contents(),w)
draws=[args[0] for args,op in cs.operations if op==b'Do']
name=draws[1]
for im in p.images:
 if im.indirect_reference.idnum==p['/Resources']['/XObject'].raw_get(name).idnum:
  image=ImageOps.exif_transpose(Image.open('/Users/jari/Desktop/IMG_5480.jpeg')).convert('RGB');image.thumbnail((2400,1800));im.replace(image,quality=92);break
else:raise RuntimeError('Image not located')
b=BytesIO();c=canvas.Canvas(b,pagesize=(595.28,841.89))
c.setFillColorRGB(1,1,1);c.rect(54,841.89-724,490,36,stroke=0,fill=1)
t='Kuva 8. Vene kiinnitettynä uuteen laituriin (IMG_5480). Omistajan mukaan veneen kiinnittäminen laituriin onnistuu helposti. Laituri on rakennettu betonirenkaiden ja kivien päälle.'
s=ParagraphStyle('caption',fontName='Helvetica',fontSize=10,leading=15)
a=Paragraph(t,s);_,h=a.wrap(483,60);a.drawOn(c,56,841.89-692-h)
c.save();p.merge_page(PdfReader(b).pages[0])
with open(path+'.tmp','wb') as f:w.write(f)
import os
os.replace(path+'.tmp',path)
print('Updated',len(w.pages),'pages')
