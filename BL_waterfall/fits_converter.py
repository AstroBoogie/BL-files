import pyfits
import numpy as np
import json

f = pyfits.open('./fits/ucb-amp194.fits')
fitsData = f[0].data
# f is the fits file, [0] is the HDU or the
# print(fitsData[0].header)
print(f)
print(fitsData)
#run
fitsData = fitsData.tolist()
with open('json/pyfits.txt', 'w') as outfile:
    json.dump(fitsData, outfile)

outfile.close()