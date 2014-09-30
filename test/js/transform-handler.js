suite('transform-handler parsing', function() {
  test('parse skew values', function() {
    assert.deepEqual(parseTransform('skew(10deg) skew(12deg,45deg) skewX(0) skewY(1.5rad)'), [
      {t: 'skew', d: [{deg: 10}, {deg: 0}]},
      {t: 'skew', d: [{deg: 12}, {deg: 45}]},
      {t: 'skewx', d: [{deg: 0}]},
      {t: 'skewy', d: [{rad: 1.5}]}
    ]);
  });

  test('parse scale values', function() {
    assert.deepEqual(parseTransform('scale(-2) scale(3,-4) scaleX(5) scaleY(-1) scaleZ(-3)'), [
      {t: 'scale', d: [-2, -2]},
      {t: 'scale', d: [3, -4]},
      {t: 'scalex', d: [5]},
      {t: 'scaley', d: [-1]},
      {t: 'scalez', d: [-3]}
    ]);
    assert.deepEqual(parseTransform('scale3d(-2, 0, 7)'),
        [{t: 'scale3d', d: [-2, 0, 7]}]);
  });

  test('parse rotate values', function() {
    assert.deepEqual(parseTransform('rotate(10deg) rotateX(0) rotateY(1.5rad) rotateZ(50grad)'), [
      {t: 'rotate', d: [{deg: 10}]},
      {t: 'rotatex', d: [{deg: 0}]},
      {t: 'rotatey', d: [{rad: 1.5}]},
      {t: 'rotatez', d: [{grad: 50}]}
    ]);
  });

  test('parse translate values', function() {
    assert.deepEqual(parseTransform('translate(20%, 30px) translate(30em, 40%) translate(50vw) translate(0)'), [
      {t: 'translate', d: [{'%': 20}, {px: 30}]},
      {t: 'translate', d: [{em: 30}, {'%': 40}]},
      {t: 'translate', d: [{vw: 50}, {px: 0}]},
      {t: 'translate', d: [{px: 0}, {px: 0}]}
    ]);
    assert.deepEqual(parseTransform('translateX(10px) translateX(20%) translateX(0)'), [
      {t: 'translatex', d: [{px: 10}]},
      {t: 'translatex', d: [{'%': 20}]},
      {t: 'translatex', d: [{px: 0}]}
    ]);
    assert.deepEqual(parseTransform('translateY(10px) translateY(20%) translateY(0)'), [
      {t: 'translatey', d: [{px: 10}]},
      {t: 'translatey', d: [{'%': 20}]},
      {t: 'translatey', d: [{px: 0}]}
    ]);
    assert.deepEqual(parseTransform('translateZ(10px) translateZ(0)'), [
      {t: 'translatez', d: [{px: 10}]},
      {t: 'translatez', d: [{px: 0}]}
    ]);
    assert.deepEqual(parseTransform('translate3d(10px, 20px, 30px) translate3d(0, 40%, 0) translate3d(50%, 0, 60px)'), [
      {t: 'translate3d', d: [{px: 10}, {px: 20}, {px: 30}]},
      {t: 'translate3d', d: [{px: 0}, {'%': 40}, {px: 0}]},
      {t: 'translate3d', d: [{'%': 50}, {px: 0}, {px: 60}]}
    ]);
  });

  test('invalid transforms fail to parse', function() {
    assert.isUndefined(parseTransform('translate(10px'));
    assert.isUndefined(parseTransform('translate()'));
    assert.isUndefined(parseTransform('translatex()'));
    assert.isUndefined(parseTransform('translatex(5)'));
    assert.isUndefined(parseTransform('rotate(5)'));
    assert.isUndefined(parseTransform('skew(5)'));
    assert.isUndefined(parseTransform('scale(5px)'));
    assert.isUndefined(parseTransform('rotatex(5px)'));
  });
});

suite('transform-handler interpolation', function() {
  test('simple transform interpolations', function() {
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'translateX(10px)',
            'translateX(20px)')(0.2),
        'translatex(12px)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'translate(10px, 10px) rotate(20deg)',
            'translate(20px, 20px) rotate(90deg)')(0.2),
        'translate(12px,12px) rotate(34deg)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'translate(10px, 10em) rotate(20deg)',
            'translate(20em, 20px) rotate(90deg)')(0.5),
        'translate(calc(5px + 10em),calc(5em + 10px)) rotate(55deg)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'rotateY(1000deg)',
            'rotateY(3000deg)')(0.4),
        'rotatey(1800deg)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'scale(6)',
            'scale(1,-4)')(0.2),
        'scale(5,4)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'skewX(5deg) translateY(5px)',
            'skewX(-35deg) translateY(45px)')(0.25),
        'skewx(-5deg) translatey(15px)');
  });

  test('transform interpolations with conversion to primitives', function() {
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'translateX(10px)',
            'translate(20px, 10px)')(0.2),
        'translate(12px,2px)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'translateX(10px)',
            'translateY(10px)')(0.2),
        'translate(8px,2px)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'translateX(10px)',
            'translateZ(10px)')(0.2),
        'translate3d(8px,0px,2px)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'scaleX(6)',
            'scale(1,6)')(0.2),
        'scale(5,2)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'skew(10deg)',
            'skewY(30deg)')(0.2),
        'skew(8deg,6deg)');
  });

  test('transform interpolations with none', function() {
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'none',
            'scale(5) translateX(100px) rotate(1000deg)')(0.25),
        'scale(2,2) translatex(25px) rotate(250deg)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'scale(5) translateX(100px) rotate(1000deg)',
            'none')(0.75),
        'scale(2,2) translatex(25px) rotate(250deg)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'none',
            'scaleX(5) skewY(100grad)')(0.25),
        'scalex(2) skewy(25grad)');
    assert.equal(
        webAnimationsMinifill.propertyInterpolation(
            'transform',
            'none',
            'none')(0.4),
        'none');
  });

  test('transform interpolations with matrices', function() {
    var interpolatedMatrix = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'matrix(1, 0, 0, 1, 0, 0)',
        'matrix(1, -0.2, 0, 1, 0, 0)');
    var evaluatedInterp = interpolatedMatrix(0.5);
    var interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 1, 0.01);
    assert.closeTo(Number(interpElements[1]), -0.1, 0.01);
    assert.closeTo(Number(interpElements[2]), 0, 0.01);
    assert.closeTo(Number(interpElements[3]), 1, 0.01);
    assert.closeTo(Number(interpElements[4]), 0, 0.01);
    assert.closeTo(Number(interpElements[5]), 0, 0.01);

    var interpolatedMatrix3D = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'matrix(1, 0, 0, 1, 0, 0)',
        'matrix3d(1, 1, 0, 0, -2, 1, 0, 0, 0, 0, 1, 0, 10, 10, 0, 1)');
    var evaluatedInterp3D = interpolatedMatrix3D(0.5);
    var interpElements3D = evaluatedInterp3D.slice(
        evaluatedInterp3D.indexOf('(') + 1, evaluatedInterp3D.lastIndexOf(')')).split(',');
    assert.equal(interpElements3D.length, 6);
    assert.closeTo(Number(interpElements3D[0]), 1.12, 0.01);
    assert.closeTo(Number(interpElements3D[1]), 0.46, 0.01);
    assert.closeTo(Number(interpElements3D[2]), -0.84, 0.01);
    assert.closeTo(Number(interpElements3D[3]), 1.34, 0.01);
    assert.closeTo(Number(interpElements3D[4]), 5, 0.01);
    assert.closeTo(Number(interpElements3D[5]), 5, 0.01);

    var interpolatedMatrix3DComplex = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'matrix(1, 0, 0, 1, 0, 0)',
        'matrix3d(1, 1, 3, 0, -2, 1, 0, 0, 0, 0, 1, 0, 10, 10, 0, 1)');
    var evaluatedInterp3DComplex = interpolatedMatrix3DComplex(0.5);
    var interpElements3DComplex = evaluatedInterp3DComplex.slice(
        evaluatedInterp3DComplex.indexOf('(') + 1, evaluatedInterp3DComplex.lastIndexOf(')')).split(',');
    assert.equal(interpElements3DComplex.length, 16);
    assert.closeTo(Number(interpElements3DComplex[0]), 1.73, 0.01);
    assert.closeTo(Number(interpElements3DComplex[1]), 0.67, 0.01);
    assert.closeTo(Number(interpElements3DComplex[2]), 1.10, 0.01);
    assert.closeTo(Number(interpElements3DComplex[3]), 0, 0.01);
    assert.closeTo(Number(interpElements3DComplex[4]), -0.85, 0.01);
    assert.closeTo(Number(interpElements3DComplex[5]), 1.34, 0.01);
    assert.closeTo(Number(interpElements3DComplex[6]), 0.29, 0.01);
    assert.closeTo(Number(interpElements3DComplex[7]), 0, 0.01);
    // FIXME: These 3 values are different from the native impl (and FF), which gives 0.31, 0.04, 1.01.
    // Result looks the same.
    assert.closeTo(Number(interpElements3DComplex[8]), -0.35, 0.01);
    assert.closeTo(Number(interpElements3DComplex[9]), -0.22, 0.01);
    assert.closeTo(Number(interpElements3DComplex[10]), 0.58, 0.01);
    assert.closeTo(Number(interpElements3DComplex[11]), 0, 0.01);
    assert.closeTo(Number(interpElements3DComplex[12]), 5, 0.01);
    assert.closeTo(Number(interpElements3DComplex[13]), 5, 0.01);
    assert.closeTo(Number(interpElements3DComplex[14]), 0, 0.01);
    assert.closeTo(Number(interpElements3DComplex[15]), 1, 0.01);
  });

  test('transform interpolations that require matrix decomposition', function() {
    var interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'translate(10px)',
        'scale(2)');
    var evaluatedInterp = interp(0.4);
    var interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 1.4, 0.01);
    assert.closeTo(Number(interpElements[1]), 0, 0.01);
    assert.closeTo(Number(interpElements[2]), 0, 0.01);
    assert.closeTo(Number(interpElements[3]), 1.4, 0.01);
    assert.closeTo(Number(interpElements[4]), 6, 0.01);
    assert.closeTo(Number(interpElements[5]), 0, 0.01);

    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'scale(2)',
        'translate(10px)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 1.6, 0.01);
    assert.closeTo(Number(interpElements[1]), 0, 0.01);
    assert.closeTo(Number(interpElements[2]), 0, 0.01);
    assert.closeTo(Number(interpElements[3]), 1.6, 0.01);
    assert.closeTo(Number(interpElements[4]), 4, 0.01);
    assert.closeTo(Number(interpElements[5]), 0, 0.01);

    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'rotateX(10deg)',
        'rotateY(20deg)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 16);
    assert.closeTo(Number(interpElements[0]), 0.99, 0.01);
    assert.closeTo(Number(interpElements[1]), 0.01, 0.01);
    assert.closeTo(Number(interpElements[2]), -0.14, 0.01);
    assert.closeTo(Number(interpElements[3]), 0, 0.01);
    assert.closeTo(Number(interpElements[4]), 0.01, 0.01);
    assert.closeTo(Number(interpElements[5]), 1.00, 0.01);
    assert.closeTo(Number(interpElements[6]), 0.10, 0.01);
    assert.closeTo(Number(interpElements[7]), 0, 0.01);
    assert.closeTo(Number(interpElements[8]), 0.14, 0.01);
    assert.closeTo(Number(interpElements[9]), -0.10, 0.01);
    assert.closeTo(Number(interpElements[10]), 0.98, 0.01);
    assert.closeTo(Number(interpElements[11]), 0, 0.01);
    assert.closeTo(Number(interpElements[12]), 0, 0.01);
    assert.closeTo(Number(interpElements[13]), 0, 0.01);
    assert.closeTo(Number(interpElements[14]), 0, 0.01);
    assert.closeTo(Number(interpElements[15]), 1, 0.01);

    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'rotateX(10deg)',
        'translate(10px) rotateX(200deg)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 16);
    assert.closeTo(Number(interpElements[0]), 1, 0.01);
    assert.closeTo(Number(interpElements[1]), 0, 0.01);
    assert.closeTo(Number(interpElements[2]), 0, 0.01);
    assert.closeTo(Number(interpElements[3]), 0, 0.01);
    assert.closeTo(Number(interpElements[4]), 0, 0.01);
    assert.closeTo(Number(interpElements[5]), 0.53, 0.01);
    assert.closeTo(Number(interpElements[6]), -0.85, 0.01);
    assert.closeTo(Number(interpElements[7]), 0, 0.01);
    assert.closeTo(Number(interpElements[8]), 0, 0.01);
    assert.closeTo(Number(interpElements[9]), 0.85, 0.01);
    assert.closeTo(Number(interpElements[10]), 0.53, 0.01);
    assert.closeTo(Number(interpElements[11]), 0, 0.01);
    assert.closeTo(Number(interpElements[12]), 4, 0.01);
    assert.closeTo(Number(interpElements[13]), 0, 0.01);
    assert.closeTo(Number(interpElements[14]), 0, 0.01);
    assert.closeTo(Number(interpElements[15]), 1, 0.01);

    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'rotate(0rad) translate(0px)',
        'translate(800px) rotate(9rad)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 0.47, 0.01);
    assert.closeTo(Number(interpElements[1]), 0.89, 0.01);
    assert.closeTo(Number(interpElements[2]), -0.89, 0.01);
    assert.closeTo(Number(interpElements[3]), 0.47, 0.01);
    assert.closeTo(Number(interpElements[4]), 320, 0.01);
    assert.closeTo(Number(interpElements[5]), 0, 0.01);

    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'translate(0px, 0px) rotate(0deg) scale(1)',
        'scale(3) translate(300px, 90px) rotate(9rad)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 0.84, 0.01);
    assert.closeTo(Number(interpElements[1]), 1.59, 0.01);
    assert.closeTo(Number(interpElements[2]), -1.59, 0.01);
    assert.closeTo(Number(interpElements[3]), 0.84, 0.01);
    assert.closeTo(Number(interpElements[4]), 360, 0.01);
    assert.closeTo(Number(interpElements[5]), 108, 0.01);

    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'translate(0px, 0px) scale(1)',
        'scale(3) translate(300px, 90px) rotate(9rad)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 0.84, 0.01);
    assert.closeTo(Number(interpElements[1]), 1.59, 0.01);
    assert.closeTo(Number(interpElements[2]), -1.59, 0.01);
    assert.closeTo(Number(interpElements[3]), 0.84, 0.01);
    assert.closeTo(Number(interpElements[4]), 360, 0.01);
    assert.closeTo(Number(interpElements[5]), 108, 0.01);

    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'translate(0px, 0px) rotate(0deg) scale(1)',
        'translate(900px, 190px) scale(3) rotate(9rad)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 0.84, 0.01);
    assert.closeTo(Number(interpElements[1]), 1.59, 0.01);
    assert.closeTo(Number(interpElements[2]), -1.59, 0.01);
    assert.closeTo(Number(interpElements[3]), 0.84, 0.01);
    assert.closeTo(Number(interpElements[4]), 360, 0.01);
    assert.closeTo(Number(interpElements[5]), 76, 0.01);

    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'translate(0px, 0px) skew(30deg)',
        'skew(0deg) translate(300px, 90px)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 1, 0.01);
    assert.closeTo(Number(interpElements[1]), 0, 0.01);
    assert.closeTo(Number(interpElements[2]), 0.35, 0.01);
    assert.closeTo(Number(interpElements[3]), 1, 0.01);
    assert.closeTo(Number(interpElements[4]), 120, 0.01);
    assert.closeTo(Number(interpElements[5]), 36, 0.01);

    // This case agrees with FireFox and the spec, but not with the old polyfill (or Blink). The old
    // polyfill only does matrix decomposition on the rotate and scale sections of the function
    // lists.
    interp = webAnimationsMinifill.propertyInterpolation(
        'transform',
        'translate(0px)',
        'translate(800px) rotate(9rad)');
    evaluatedInterp = interp(0.4);
    interpElements = evaluatedInterp.slice(
        evaluatedInterp.indexOf('(') + 1, evaluatedInterp.lastIndexOf(')')).split(',');
    assert.equal(interpElements.length, 6);
    assert.closeTo(Number(interpElements[0]), 0.47, 0.01);
    assert.closeTo(Number(interpElements[1]), 0.89, 0.01);
    assert.closeTo(Number(interpElements[2]), -0.89, 0.01);
    assert.closeTo(Number(interpElements[3]), 0.47, 0.01);
    assert.closeTo(Number(interpElements[4]), 320, 0.01);
    assert.closeTo(Number(interpElements[5]), 0, 0.01);
  });
});
