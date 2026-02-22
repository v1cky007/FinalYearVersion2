// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StegoRegistry {
    struct StegoRecord {
        address owner;
        string fragment; // Stores 50% of the encrypted data
        uint256 timestamp;
    }

    mapping(bytes32 => StegoRecord) public records;

    event StegoRegistered(bytes32 indexed imageHash, address owner);

    function registerStego(bytes32 _imageHash, string memory _fragment) external {
        require(records[_imageHash].timestamp == 0, "Image already registered");

        records[_imageHash] = StegoRecord(
            msg.sender,
            _fragment,
            block.timestamp
        );

        emit StegoRegistered(_imageHash, msg.sender);
    }

    function getFragment(bytes32 _imageHash) external view returns (string memory) {
        return records[_imageHash].fragment;
    }
}