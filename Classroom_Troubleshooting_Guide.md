# Cockpit Tools Classroom Troubleshooting Guide

## Quick Reference for Common Issues

### Authentication Issues

#### Problem: "OAuth Sign-in Failed"
**Symptoms:** Student cannot complete OAuth authentication
**Possible Causes:**
- Incorrect email or password
- Platform website is down
- Network connectivity issues
- Platform requires additional verification

**Solutions:**
1. **Verify credentials:** Ask student to double-check email/password
2. **Try alternative method:** Use "Local Import" instead of OAuth
3. **Check platform status:** Visit platform website directly
4. **Network check:** Ensure internet connection is working
5. **Additional verification:** Some platforms require 2FA or email verification

#### Problem: "Account Not Appearing in Dashboard"
**Symptoms:** Student completes setup but account doesn't show
**Possible Causes:**
- Setup process not completed
- Cockpit Tools needs refresh
- Authentication token not received
- Platform account not actually created

**Solutions:**
1. **Refresh Cockpit Tools:** Close and reopen the application
2. **Verify completion:** Ensure student completed all authentication steps
3. **Try again:** Repeat the account addition process
4. **Check platform:** Verify account actually exists on platform website
5. **Check error logs:** Look for error messages in Cockpit Tools

#### Problem: "Invalid Redirect URI Error"
**Symptoms:** OAuth shows redirect URI error (common with Windsurf)
**Possible Causes:**
- Platform OAuth configuration issue
- Network/firewall blocking redirect
- Platform-specific OAuth requirements

**Solutions:**
1. **Use Local Import:** Import from existing installation instead
2. **Check network:** Ensure no firewall is blocking OAuth
3. **Platform-specific:** Some platforms require specific OAuth setup
4. **Wait and retry:** Sometimes temporary platform issues

### Account Switching Issues

#### Problem: "Account Won't Switch"
**Symptoms:** Clicking "Switch" doesn't activate the account
**Possible Causes:**
- Account authentication token expired
- Cockpit Tools needs restart
- Network connectivity issue
- Platform session conflict

**Solutions:**
1. **Restart Cockpit Tools:** Close and reopen the application
2. **Re-authenticate:** Remove and re-add the account
3. **Check network:** Ensure internet connection is stable
4. **Check platform:** Ensure account is active on platform website

#### Problem: "Multiple Accounts Won't Switch"
**Symptoms:** Can switch to one account but not others
**Possible Causes:**
- Some accounts have expired tokens
- Platform-specific issues
- Incomplete setup for some accounts

**Solutions:**
1. **Re-authenticate affected accounts:** Remove and re-add problematic accounts
2. **Check each platform:** Verify each account is active on its platform
3. **Platform-specific troubleshooting:** Address each platform individually

### IDE Launching Issues

#### Problem: "IDE Won't Launch"
**Symptoms:** Clicking "Launch" doesn't open the IDE
**Possible Causes:**
- IDE not installed or wrong path
- Cockpit Tools can't find IDE executable
- IDE process already running
- Permission issues

**Solutions:**
1. **Verify IDE installation:** Check IDE is installed in expected location
2. **Check path:** Ensure Cockpit Tools has correct IDE path in settings
3. **Close existing IDE:** Check if IDE is already running
4. **Run as administrator:** Try launching Cockpit Tools with admin rights

#### Problem: "IDE Opens with Wrong Account"
**Symptoms:** IDE launches but shows different user's account
**Possible Causes:**
- Account switching didn't complete
- IDE has cached credentials
- Platform session conflict

**Solutions:**
1. **Complete account switch:** Ensure switch process finished
2. **Clear IDE cache:** Clear IDE's local cache/data
3. **Re-authenticate:** Remove and re-add the account
4. **Restart IDE:** Close IDE completely and try again

### Platform-Specific Issues

#### Cursor Issues
**Common Problems:**
- OAuth redirect errors
- Account not recognized
- Quota not displaying

**Solutions:**
- Use "Local Import" from Cursor installation
- Verify Cursor account exists on cursor.com
- Check Cursor account status in browser

#### Windsurf/Devin Issues
**Common Problems:**
- Redirect URI errors (very common)
- Authentication failures
- Session conflicts

**Solutions:**
- Always use "Local Import" for Windsurf/Devin
- Clear Windsurf/Devin cache before import
- Restart Windsurf/Devin before importing

#### Kiro IDE Issues
**Common Problems:**
- AWS authentication complexity
- Session timeouts
- Quota calculation errors

**Solutions:**
- Ensure AWS account is properly configured
- Use OAuth with AWS credentials
- Check Kiro quota on AWS console

#### Qoder, Trae, WorkBuddy Issues
**Common Problems:**
- Platform-specific OAuth requirements
- Account verification pending
- Quota sync delays

**Solutions:**
- Follow platform-specific authentication flow
- Complete email verification if required
- Allow time for quota data to sync

### Technical Issues

#### Problem: "Cockpit Tools Won't Start"
**Symptoms:** Application won't launch or crashes immediately
**Possible Causes:**
- Installation corruption
- Missing dependencies
- Port conflicts
- File permission issues

**Solutions:**
1. **Restart PC:** Simple restart often fixes issues
2. **Reinstall Cockpit Tools:** Use uninstaller and reinstall
3. **Check port conflicts:** Ensure port 19528 is available
4. **Run as administrator:** Try launching with admin rights
5. **Check logs:** Look for error logs in Cockpit Tools directory

#### Problem: "Dashboard Not Loading"
**Symptoms:** Cockpit Tools opens but dashboard is blank or errors
**Possible Causes:**
- Network connectivity issues
- Configuration file corruption
- Database lock issues

**Solutions:**
1. **Check internet:** Ensure network connection is working
2. **Reset configuration:** Delete config.json and restart
3. **Clear database:** Remove account databases and re-add accounts
4. **Check for updates:** Ensure Cockpit Tools is latest version

### Student-Specific Issues

#### Problem: "Student Doesn't Have Platform Account"
**Symptoms:** Student hasn't created account on AI IDE platform
**Solutions:**
1. **Direct to sign-up:** Provide platform sign-up link
2. **Create during session:** Allow time for account creation
3. **Use different platform:** Start with a platform they have account for
4. **Peer help:** Have student with account help them create one

#### Problem: "Student Forgot Password"
**Symptoms:** Student can't remember their platform password
**Solutions:**
1. **Password reset:** Guide student to platform password reset
2. **Create new account:** If reset fails, create new account
3. **Use different platform:** Start with platform they have credentials for

#### Problem: "Student Email Not Accepted"
**Symptoms:** Platform won't accept student's email domain
**Solutions:**
1. **Check platform requirements:** Some platforms restrict email domains
2. **Use alternative email:** Use different email if available
3. **Contact platform support:** Check if domain can be whitelisted

### Session Management Issues

#### Problem: "Previous Student's Account Still Active"
**Symptoms:** New student sees previous student's account
**Solutions:**
1. **Complete logout:** Ensure previous student completed logout
2. **Switch accounts:** Use Cockpit Tools to switch to correct account
3. **Clear session:** Restart Cockpit Tools to clear sessions
4. **Browser cleanup:** Clear browser cookies if using web-based setup

#### Problem: "Session Timeout During Setup"
**Symptoms:** Student's session times out while adding account
**Solutions:**
1. **Complete quickly:** Encourage students to work efficiently
2. **Have credentials ready:** Ask students to have passwords ready
3. **Use faster method:** OAuth is usually faster than manual token import

### Network and Connectivity Issues

#### Problem: "Network Blocked or Slow"
**Symptoms:** Authentication fails due to network issues
**Solutions:**
1. **Check connection:** Verify internet is working
2. **Try different network:** Switch to different network if available
3. **Use local import:** Bypass network with local import method
4. **Contact IT:** Report network issues to IT department

### Emergency Procedures

#### If Cockpit Tools Completely Fails:
1. **Restart the application** - Try 2-3 times
2. **Restart the PC** - This fixes many issues
3. **Use platform directly** - Students can use IDEs without Cockpit Tools temporarily
4. **Reschedule session** - If technical issues persist, reschedule

#### If Multiple Students Have Same Issue:
1. **Identify pattern** - Note what's common among affected students
2. **Check platform status** - Platform may be having widespread issues
3. **Switch approach** - Use alternative method (OAuth vs local import)
4. **Contact support** - May need platform or Cockpit Tools support

#### If Student Cannot Complete Setup:
1. **Document the issue** - Note specific error and steps taken
2. **Offer alternative** - Use different platform or different session
3. **Provide individual help** - Schedule one-on-one help session
4. **Escalate if needed** - Contact technical support for complex issues

## Prevention and Best Practices

### Before Session:
- ✅ Test Cockpit Tools with your own account
- ✅ Verify all IDEs are properly installed
- ✅ Check network connectivity
- ✅ Have platform sign-up links ready
- ✅ Prepare troubleshooting materials

### During Session:
- ✅ Keep the session moving on schedule
- ✅ Encourage peer-to-peer help
- ✅ Document recurring issues
- ✅ Have backup plans ready
- ✅ Focus on technical issues only

### After Session:
- ✅ Update troubleshooting guide with new issues found
- ✅ Monitor dashboard for first week
- ✅ Collect student feedback
- ✅ Address any outstanding issues
- ✅ Refine process for next session

## Contact Information

**Technical Support:** [Your contact information]
**Platform Support Links:**
- Cursor: https://www.cursor.com/support
- Windsurf: https://codeium.com/support
- Kiro: https://aws.amazon.com/kiro/support
- Qoder: https://qoder.com/support
- Trae: https://www.trae.ai/support
- WorkBuddy: https://workbuddy.ai/support

**Emergency Contact:** [Your emergency contact]
**IT Department:** [Your IT department contact]