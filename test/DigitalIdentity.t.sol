// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DigitalIdentity} from "../src/DigitalIdentity.sol";

contract DigitalIdentityTest is Test {
    DigitalIdentity public identity;

    address verifier = address(1);
    address user = address(2);
    address attacker = address(3);

    bytes32 identityHash =
        keccak256(abi.encodePacked("USER-IDENTITY-001"));

    function setUp() public {
        vm.prank(verifier);
        identity = new DigitalIdentity();
    }

    function testVerifierIsSetCorrectly() public {
        assertEq(identity.verifier(), verifier);
    }

    function testVerifyIdentity() public {
        vm.prank(verifier);

        identity.verifyIdentity(user, identityHash);

        assertTrue(identity.isVerified(user));

        (
            bytes32 storedHash,
            bool verified,
            uint256 verifiedAt
        ) = identity.getIdentity(user);

        assertEq(storedHash, identityHash);
        assertTrue(verified);
        assertGt(verifiedAt, 0);
    }

    function testRevokeIdentity() public {
        vm.startPrank(verifier);

        identity.verifyIdentity(user, identityHash);
        identity.revokeIdentity(user);

        vm.stopPrank();

        assertFalse(identity.isVerified(user));
    }

    function testOnlyVerifierCanVerify() public {
        vm.prank(attacker);

        vm.expectRevert("Not authorized");
        identity.verifyIdentity(user, identityHash);
    }

    function testOnlyVerifierCanRevoke() public {
        vm.startPrank(verifier);
        identity.verifyIdentity(user, identityHash);
        vm.stopPrank();

        vm.prank(attacker);

        vm.expectRevert("Not authorized");
        identity.revokeIdentity(user);
    }

    function testCannotVerifyInvalidUser() public {
        vm.prank(verifier);

        vm.expectRevert("Invalid user");
        identity.verifyIdentity(address(0), identityHash);
    }

    function testCannotVerifyEmptyHash() public {
        vm.prank(verifier);

        vm.expectRevert("Invalid identity hash");
        identity.verifyIdentity(user, bytes32(0));
    }

    function testChangeVerifier() public {
        address newVerifier = address(4);

        vm.prank(verifier);
        identity.changeVerifier(newVerifier);

        assertEq(identity.verifier(), newVerifier);
    }

    function testOnlyVerifierCanChangeVerifier() public {
        address newVerifier = address(4);

        vm.prank(attacker);

        vm.expectRevert("Not authorized");
        identity.changeVerifier(newVerifier);
    }
}

