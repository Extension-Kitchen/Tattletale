{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        nixpkgs-ctor = import nixpkgs;
        pkgs = nixpkgs-ctor {
          system = "aarch64-darwin";
        };
        pkgsX86Darwin = nixpkgs-ctor {
          inherit self; system = "x86_64-darwin";
        };
        
        darwinDeps = with pkgs; if stdenv.hostPlatform.isDarwin then [
          darwin.apple_sdk.frameworks.Security
          darwin.apple_sdk.frameworks.ApplicationServices
        ] else [];
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Select nix environment
            nix-direnv

            # Nix
            nixpkgs-fmt
            
            # Node
            nodejs
          ] ++ darwinDeps;
        };
      });
}
