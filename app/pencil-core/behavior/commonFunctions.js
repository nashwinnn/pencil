var F = {};
pencilSandbox.F = F;

// Finds an object by its name
Pencil.findObjectByName = function (ref, name) {
    const shape = Dom.findTop(ref, node => 
        node.getAttributeNS && node.getAttributeNS(PencilNamespaces.p, "type") === "Shape"
    );

    return Dom.getSingle(`.//*[@p:name='${name}']`, shape);
};

// Finds an object by its ID
Pencil.findObjectById = function (ref, id) {
    const shape = Dom.findTop(ref, node => 
        node.getAttributeNS && node.getAttributeNS(PencilNamespaces.p, "type") === "Shape"
    );

    return Dom.getSingle(`.//*[@id='${id}']`, shape);
};

// Get the size of rich text
F.richTextSize = function (name) {
    const target = Pencil.findObjectByName(this._target, name);
    if (!target) return new Dimension(0, 0);

    const firstChild = target.firstChild;
    if (!firstChild) return new Dimension(0, 0);

    const metrics = Util.textMetrics(firstChild);
    return new Dimension(metrics.width, metrics.height);
};

// Get the size of text
F.textSize = function (name) {
    const target = Pencil.findObjectByName(this._target, name);
    if (!target) return new Dimension(0, 0);

    const bbox = target.getBBox();
    return new Dimension(bbox.width, bbox.height);
};

// Find an object by its name
F.findObjectByName = Pencil.findObjectByName;

// Get the bounding box of an object
F.getObjectBoundingBox = function (name) {
    const target = Pencil.findObjectByName(this._target, name);
    if (!target) return { x: 0, y: 0, w: 0, h: 0 };

    const bbox = target.getBBox();
    return { x: bbox.x, y: bbox.y, w: bbox.width, h: bbox.height };
};

// Get the size of an HTML element
F.elementSize = function (name) {
    const target = Pencil.findObjectByName(this._target, name);
    if (!target || target.namespaceURI !== PencilNamespaces.html) return new Dimension(0, 0);

    return new Dimension(target.offsetWidth, target.offsetHeight);
};

// Get the relative location of a handle
F.getRelativeLocation = function (handle, box) {
    if (box.w === 0) return "top";

    const y1 = (box.h * handle.x) / box.w;    
    const y2 = box.h - (box.h * handle.x / box.w); 

    if (handle.y < y1) {
        return handle.y < y2 ? "top" : "right";
    } else {
        return handle.y < y2 ? "left" : "bottom";
    }
};

// Rotate a point around an origin
F.rotate = function(a, o, rad) {
    return {
        x: (a.x - o.x) * Math.cos(rad) - (a.y - o.y) * Math.sin(rad) + o.x,
        y: (a.x - o.x) * Math.sin(rad) + (a.y - o.y) * Math.cos(rad) + o.y
    };
};

// Create a new DOM element
F.newDOMElement = function (spec) {
    const e = spec._uri ? 
        this._target.ownerDocument.createElementNS(spec._uri, spec._name) : 
        this._target.ownerDocument.createElement(spec._name);

    for (const name in spec) {
        if (name.startsWith('_')) continue; // Skip internal properties
        e.setAttribute(name, spec[name]);
    }

    if (spec._text) {
        e.appendChild(e.ownerDocument.createTextNode(spec._text));
    }

    if (spec._children && spec._children.length > 0) {
        e.appendChild(F.newDOMFragment(spec._children));
    }

    return e;
};

// Create a new document fragment
F.newDOMFragment = function (specs) {
    const f = this._target.ownerDocument.createDocumentFragment();

    for (const spec of specs) {
        f.appendChild(this.newDOMElement(spec));
    }
    return f;
};

// Other functions remain unchanged...

