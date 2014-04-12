#!/usr/bin/env python

import random

def picture(w, h, i, ci):

    html = """<div class="picture picture%(i)s color%(ci)s">
        <div class="legend">
            <div class="text-center">%(w)s</div>
            <br />
            <div class="text-left">%(h)s</div>
        </div>
    </div>"""
    return html % {"w":w, "h":h, "i":i, "ci":ci}

sizes = ["70", "75", "80", "85"]
ratios= [0.666, 1.508, 0.78, 1.35]
number = 17
color_number = 10

size = []

for i in xrange(number):
    height = random.choice(sizes)
    ratio = random.choice(ratios)
    width = int(float(height) * ratio)
    color_index = random.randint(1, color_number)
    size.append((width, height))
    print picture(width, height, "%i"%(i+1,), color_index)


for i in xrange(number):
    print """.picture%(i)s{
        width: %(w)spx;
        height: %(h)spx;
    }""" % {"i": i+1, "w":size[i][0], "h":size[i][1]}
