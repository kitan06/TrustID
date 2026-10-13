// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DigitalIdentity {
    address public verifier;

    struct Identity {
        bytes32 identityHash;
        bool verified;
        uint256 verifiedAt;
    }

    mapping(address => Identity) private identities;

    event IdentityVerified(
        address indexed user,
        bytes32 indexed identityHash,
        uint256 timestamp
    );

    event IdentityRevoked(
        address indexed user,
        uint256 timestamp
    );

    event VerifierChanged(
        address indexed oldVerifier,
        address indexed newVerifier
    );

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Not authorized");
        _;
    }

    constructor() {
        verifier = msg.sender;
    }

    function verifyIdentity(
        address user,
        bytes32 identityHash
    ) external onlyVerifier {
        require(user != address(0), "Invalid user");
        require(identityHash != bytes32(0), "Invalid identity hash");

        identities[user] = Identity({
            identityHash: identityHash,
            verified: true,
            verifiedAt: block.timestamp
        });

        emit IdentityVerified(
            user,
            identityHash,
            block.timestamp
        );
    }

    function revokeIdentity(address user) external onlyVerifier {
        require(user != address(0), "Invalid user");
        require(identities[user].verified, "Identity not verified");

        identities[user].verified = false;

        emit IdentityRevoked(user, block.timestamp);
    }

    function isVerified(address user)
        external
        view
        returns (bool)
    {
        return identities[user].verified;
    }

    function getIdentity(address user)
        external
        view
        returns (
            bytes32 identityHash,
            bool verified,
            uint256 verifiedAt
        )
    {
        Identity memory identity = identities[user];

        return (
            identity.identityHash,
            identity.verified,
            identity.verifiedAt
        );
    }

    function changeVerifier(address newVerifier)
        external
        onlyVerifier
    {
        require(newVerifier != address(0), "Invalid verifier");

        address oldVerifier = verifier;
        verifier = newVerifier;

        emit VerifierChanged(oldVerifier, newVerifier);
    }
}

