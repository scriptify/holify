function loadModel(name, cb) {
  var loader = new THREE.OBJLoader();
  var mtlLoader = new THREE.MTLLoader();
  mtlLoader.load(name + '.mtl', function(materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    // load a resource
    objLoader.load(
      // resource URL
      name + '.obj',
      // called when resource is loaded
      function ( object ) {
        object.name = name;
        cb(object)

      },
      // called when loading is in progresses
      function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      // called when loading has errors
      function ( error ) {

        console.log( 'An error happened' );

      }
    );
  });
}
