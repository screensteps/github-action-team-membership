# Actions Team Membership
A GitHub action that checks if an user is part of an organization team

# Usage
```yaml
- uses: screensteps/github-action-team-membership@<hash>
  with:
    organization: # optional. Default value ${{ github.repository_owner }}
                  # Organization to get membership from
    environment:  # required. The environment being deployed to
    restrictions: # required. The team to check against environment for
                  # comma separated, colon separated string
                  # 'production:Team A,staging:Team B'
    token: ****** # required. Personal Access Token with the `read:org` permission
    comment: 'You seem to not be authorized' # optional. A comment to post if the user is not part of the team.
                                             # This feature is only applicable in an issue (or PR) context
    exit: true # optional. If the action should exit if the user is not part of the team. Defaults to true.
```
## Outputs
- teams: an array containing the teams of the user.
- permitted: whether a user is part of the team or not.
