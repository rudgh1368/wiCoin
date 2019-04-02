pragma solidity ^0.5.1;

contract Validator{
    function recoverAddress(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) internal pure returns(address) {
        // bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        // bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, msgHash));

        return ecrecover(msgHash, v, r, s);
    }

    // check BalanceProof
    function checkBalanceProof(address consumer, bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) internal pure returns(bool){
        return consumer == recoverAddress(msgHash, v, r, s);
    }
}